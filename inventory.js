/* Live inventory: loads from the Google Sheet CSV, with a built-in
   fallback if the fetch fails. Sheet:
   https://docs.google.com/spreadsheets/d/1Kfi0s5Kn7eD6Jo98lKKRXTQhcTGq-BGguRJKqz-ozCU/edit
   CSV: https://docs.google.com/spreadsheets/d/1Kfi0s5Kn7eD6Jo98lKKRXTQhcTGq-BGguRJKqz-ozCU/gviz/tq?tqx=out:csv&sheet=Inventory
*/
(function () {
  var OCTANE = "https://octane.co/flex/132077/";
  var PHONES = { Bacliff: "281-559-3171", Galveston: "409-256-7717" };
  var SHEET_CSV = "https://docs.google.com/spreadsheets/d/1Kfi0s5Kn7eD6Jo98lKKRXTQhcTGq-BGguRJKqz-ozCU/gviz/tq?tqx=out:csv&sheet=Inventory";

  // Fallback rows, shaped like the Sheet (Photo, Brand, Model, Year,
  // Condition, Color, Seats, Lifted, StreetLegal, Price, Status, Location).
  var FALLBACK = [
    { Photo: "img/brands/tomberlin-beachcomber.jpg", Brand: "Tomberlin", Model: "Beachcomber", Year: 2026, Condition: "New", Color: "Light Blue", Seats: 4, Lifted: "No", StreetLegal: "Yes", Price: 15995, Status: "Available", Location: "Bacliff" },
    { Photo: "img/brands/tomberlin-ghosthawk.jpg", Brand: "Tomberlin", Model: "Evolve Ghosthawk", Year: 2026, Condition: "New", Color: "White", Seats: 4, Lifted: "Yes", StreetLegal: "Yes", Price: 18995, Status: "Available", Location: "Galveston" },
    { Photo: "img/brands/star-leo.jpg", Brand: "Star EV", Model: "LEO", Year: 2026, Condition: "New", Color: "Blue", Seats: 4, Lifted: "No", StreetLegal: "Yes", Price: 13995, Status: "Available", Location: "Bacliff" },
    { Photo: "img/brands/niu-gt.jpg", Brand: "NIU EV", Model: "GT", Year: 2026, Condition: "New", Color: "White", Seats: 4, Lifted: "No", StreetLegal: "Yes", Price: 14995, Status: "On Hold", Location: "Bacliff" },
    { Photo: "img/brands/solana-valley-22x.jpg", Brand: "Solana", Model: "Valley 22X", Year: 2026, Condition: "New", Color: "White", Seats: 4, Lifted: "Yes", StreetLegal: "Yes", Price: 16995, Status: "Available", Location: "Galveston" },
    { Photo: "img/brands/bintelli-beyond-6l.jpg", Brand: "Bintelli", Model: "Beyond 6 Seater Lifted", Year: 2026, Condition: "New", Color: "Blue", Seats: 6, Lifted: "Yes", StreetLegal: "Yes", Price: 18995, Status: "Available", Location: "Bacliff" },
    { Photo: "img/brands/aries-c4f.jpg", Brand: "Aries EV", Model: "Classic 4-Forward (C4F)", Year: 2026, Condition: "New", Color: "Champagne", Seats: 4, Lifted: "No", StreetLegal: "Yes", Price: 12995, Status: "Available", Location: "Galveston" },
    { Photo: "img/brands/activev-pulse-6l.jpg", Brand: "ActivEV", Model: "Pulse 6 Seater Lifted", Year: 2026, Condition: "New", Color: "Blue", Seats: 6, Lifted: "Yes", StreetLegal: "Yes", Price: 17995, Status: "Available", Location: "Bacliff" },
    { Photo: "img/brands/activev-pulse-2.jpg", Brand: "ActivEV", Model: "Pulse 2 Seater", Year: 2026, Condition: "New", Color: "Blue", Seats: 2, Lifted: "No", StreetLegal: "Yes", Price: 9995, Status: "Available", Location: "Galveston" },
    { Photo: "img/2016_03_precedent_i2.jpg", Brand: "Club Car", Model: "Precedent", Year: 2019, Condition: "Used", Color: "White", Seats: 4, Lifted: "No", StreetLegal: "No", Price: 6495, Status: "Available", Location: "Bacliff" }
  ];

  var INVENTORY = FALLBACK.slice();
  var grid = document.getElementById("invGrid");
  var form = document.getElementById("invFilters");
  var countEl = document.getElementById("invCount");
  var emptyEl = document.getElementById("invEmpty");
  if (!grid || !form) return;

  var prefix = grid.getAttribute("data-prefix") || "";

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }

  function yes(v) {
    return String(v).toLowerCase() === "yes" || v === true || v === 1;
  }

  function parsePrice(v) {
    if (typeof v === "number" && isFinite(v)) return v;
    var n = String(v == null ? "" : v).replace(/[^0-9.]/g, "");
    return n ? Number(n) : 0;
  }

  function parseNumber(v) {
    if (typeof v === "number" && isFinite(v)) return v;
    var n = String(v == null ? "" : v).replace(/[^0-9]/g, "");
    return n ? Number(n) : "";
  }

  // RFC-style CSV parser: quoted commas, escaped quotes, CRLF, BOM.
  function parseCSV(text) {
    text = String(text || "").replace(/^\uFEFF/, "");
    var rows = [];
    var row = [];
    var cell = "";
    var i = 0;
    var inQuotes = false;
    while (i < text.length) {
      var c = text.charAt(i);
      if (inQuotes) {
        if (c === '"') {
          if (text.charAt(i + 1) === '"') {
            cell += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        cell += c;
        i++;
        continue;
      }
      if (c === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (c === ",") {
        row.push(cell);
        cell = "";
        i++;
        continue;
      }
      if (c === "\r") {
        i++;
        continue;
      }
      if (c === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
        i++;
        continue;
      }
      cell += c;
      i++;
    }
    if (cell.length || row.length) {
      row.push(cell);
      rows.push(row);
    }
    return rows;
  }

  function rowsFromCSV(text) {
    var table = parseCSV(text);
    if (!table.length) return [];
    var headers = table[0].map(function (h) {
      return String(h || "").replace(/^\uFEFF/, "").trim();
    });
    var out = [];
    for (var r = 1; r < table.length; r++) {
      var rec = {};
      for (var c = 0; c < headers.length; c++) {
        if (!headers[c]) continue;
        rec[headers[c]] = table[r][c] != null ? String(table[r][c]).trim() : "";
      }
      if (!rec.Brand && !rec.Model) continue;
      rec.Year = parseNumber(rec.Year);
      rec.Seats = parseNumber(rec.Seats);
      rec.Price = parsePrice(rec.Price);
      out.push(rec);
    }
    return out;
  }

  function photoSrc(photo) {
    var p = String(photo || "").trim();
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    if (p.charAt(0) === "/") p = p.slice(1);
    return prefix + p;
  }

  function fillSelect(sel, values, makeLabel) {
    if (!sel) return;
    var current = sel.value;
    var keep = sel.querySelector("option[value='']");
    sel.innerHTML = "";
    if (keep) sel.appendChild(keep);
    values.forEach(function (v) {
      var o = document.createElement("option");
      o.value = String(v);
      o.textContent = makeLabel ? makeLabel(v) : String(v);
      sel.appendChild(o);
    });
    if (current) sel.value = current;
  }

  function unique(key, sortFn) {
    var seen = {};
    var out = [];
    INVENTORY.forEach(function (row) {
      var v = row[key];
      if (v != null && v !== "" && !seen[v]) {
        seen[v] = true;
        out.push(v);
      }
    });
    out.sort(sortFn || function (a, b) {
      return String(a).localeCompare(String(b), undefined, { numeric: true });
    });
    return out;
  }

  function populateFilters() {
    fillSelect(document.getElementById("invBrand"), unique("Brand"));
    fillSelect(document.getElementById("invSeats"), unique("Seats", function (a, b) { return a - b; }), function (v) {
      return v + (v === 1 ? " seat" : " seats");
    });
  }

  function visibleRows() {
    var brand = form.Brand.value;
    var condition = form.Condition.value;
    var seats = form.Seats.value;
    var price = form.Price.value;
    var location = form.Location.value;
    var min = 0, max = Infinity;
    if (price) {
      var parts = price.split("-");
      min = Number(parts[0]);
      max = Number(parts[1]);
    }
    return INVENTORY.filter(function (row) {
      if (String(row.Status).toLowerCase() === "sold") return false;
      if (brand && row.Brand !== brand) return false;
      if (condition && row.Condition !== condition) return false;
      if (seats && String(row.Seats) !== String(seats)) return false;
      if (location && row.Location !== location) return false;
      var p = Number(row.Price);
      if (p < min || p > max) return false;
      return true;
    });
  }

  function card(row) {
    var title = [row.Year, row.Brand, row.Model].filter(Boolean).join(" ");
    var interest = encodeURIComponent(title);
    var phone = PHONES[row.Location] || PHONES.Bacliff;
    var status = row.Status || "Available";
    var statusClass = String(status).toLowerCase().replace(/\s+/g, "-");
    var condClass = String(row.Condition || "").toLowerCase();
    var badges = "";
    if (yes(row.Lifted)) badges += '<span class="inv-chip">Lifted</span>';
    if (yes(row.StreetLegal)) badges += '<span class="inv-chip">Street Legal</span>';
    var badgeRow = badges ? '<div class="inv-chips">' + badges + "</div>" : "";
    var holdClass = statusClass === "on-hold" ? " is-hold" : "";
    return (
      '<article class="inv-card' + holdClass + '">' +
        '<div class="inv-photo">' +
          '<img loading="lazy" src="' + esc(photoSrc(row.Photo)) + '" alt="' + esc(title) + '">' +
          '<span class="inv-status is-' + esc(statusClass) + '">' + esc(status) + "</span>" +
          '<span class="inv-cond is-' + esc(condClass) + '">' + esc(row.Condition) + "</span>" +
        "</div>" +
        '<div class="inv-body">' +
          '<p class="eyebrow">' + esc(row.Brand) + "</p>" +
          "<h3>" + esc(row.Model) + ' <span class="inv-year">' + esc(row.Year) + "</span></h3>" +
          '<ul class="inv-meta">' +
            "<li>" + esc(row.Color) + "</li>" +
            "<li>" + esc(row.Seats) + " seats</li>" +
            "<li>" + esc(row.Location) + "</li>" +
          "</ul>" +
          badgeRow +
          '<p class="inv-price">' + money(row.Price) + "</p>" +
          '<div class="inv-actions">' +
            '<a class="btn btn-red btn-sm" href="' + esc(prefix) + "contact-us/?interest=" + interest + '">Get a Quote</a>' +
            '<a class="btn btn-sm" href="' + OCTANE + '" target="_blank" rel="noopener">Finance</a>' +
            '<a class="btn btn-lime btn-sm" href="tel:' + phone + '">Call</a>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    var rows = visibleRows();
    var total = INVENTORY.filter(function (r) {
      return String(r.Status).toLowerCase() !== "sold";
    }).length;
    grid.innerHTML = rows.map(card).join("");
    if (countEl) {
      countEl.textContent =
        rows.length === total
          ? "Showing " + rows.length + " carts"
          : "Showing " + rows.length + " of " + total + " carts";
    }
    if (emptyEl) emptyEl.hidden = rows.length > 0;
  }

  function applyData(rows, source) {
    INVENTORY = rows;
    window.GCT_INVENTORY = INVENTORY;
    window.GCT_INVENTORY_SOURCE = source;
    populateFilters();
    render();
  }

  function looksLikeCSV(text) {
    var slice = String(text || "").replace(/^\uFEFF/, "").trim();
    if (!slice || slice.charAt(0) === "<") return false;
    return /photo/i.test(slice.split(/\r?\n/, 1)[0] || "");
  }

  function loadFromSheet() {
    var url = SHEET_CSV + (SHEET_CSV.indexOf("?") >= 0 ? "&" : "?") + "cb=" + Date.now();
    return fetch(url, { cache: "no-store", credentials: "omit" }).then(function (res) {
      if (!res.ok) throw new Error("sheet HTTP " + res.status);
      return res.text();
    }).then(function (text) {
      if (!looksLikeCSV(text)) throw new Error("sheet did not return CSV");
      var rows = rowsFromCSV(text);
      if (!rows.length) throw new Error("sheet had no cart rows");
      return rows;
    });
  }

  form.addEventListener("change", render);
  form.addEventListener("reset", function () {
    setTimeout(render, 0);
  });

  // Show the fallback immediately, then replace it if the Sheet loads.
  applyData(FALLBACK, "fallback");
  loadFromSheet().then(function (rows) {
    applyData(rows, "sheet");
  }).catch(function (err) {
    console.warn("Inventory sheet unavailable, using built-in list.", err);
    applyData(FALLBACK, "fallback");
  });

  // Exposed for tests and a later CSV hookup.
  window.GCT_parseCSV = parseCSV;
  window.GCT_rowsFromCSV = rowsFromCSV;
  window.GCT_SHEET_CSV = SHEET_CSV;
})();
