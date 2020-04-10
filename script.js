var works = [];
var dates = document.getElementById("date-range");
noUiSlider.create(dates, {
  start: [1000, 2020],
  connect: true,
  step: 20,
  range: {min: 1000, max: 2020},
  pips: {mode: "values", values: [...Array(11).keys()].map(x => (x + 10) * 100), density: 2},
});

var tier_pips = [...Array(11).keys()].map(x => (x + 1) * 10);
tier_pips.unshift(1);
tier_pips.push(108);
var tiers = document.getElementById("tier-range");
noUiSlider.create(tiers, {
  start: [1, 108],
  connect: true,
  step: 1,
  range: {min: 1, max: 108},
  pips: {mode: "values", values: tier_pips, density: 100/108},
});

fetch("https://docs.google.com/document/export?format=txt&id=18t_9MHZTENbmYdezAAj4LRM0-Eak_MYO1HssZW2FX1U")
  .then(r => r.text())
  .then(a => {
                let i = -1;
                let lines = a.split(/\r?\n/);
                let main_part = false;
                for (const line of lines) {
                  if (line.startsWith("The First Tier"))
                    main_part = true;
                  else if (line.startsWith("The Absolute Bottom"))
                    break;
                  if (main_part) {
                    if (line.startsWith("The")) {
                      i++;
                    } else {
                      split = line.split(' ');
                      if (split.length && split[0] == '*') {
                        let tier = i;
                        let year_str = line.slice(line.lastIndexOf('['));
                        let year = year_str.match(/\d{4}/);
                        if (!year && year_str.includes("cent"))
                          year = year_str.match(/\d{2}/) * 100;
                        let title = year ? line.slice(line.indexOf(':') + 2, line.lastIndexOf('[') - 1) : line.slice(line.indexOf(':') + 2);
                        let comp = line.slice(2, line.indexOf(':'));
                        works.push({str: title,
                                       year: year,
                                       composer: comp,
                                       tier: i,
                                      });
                      }
                    }
                  }
                }
                document.getElementById("rng").style.visibility = "visible";
                document.getElementById("load").style.display = "none";
                function randomInteger(min, max) {
                  return Math.floor(Math.random() * (max - min + 1)) + min;
                }

               document.getElementById("rng")
                .addEventListener("submit", function(event) {
                  event.preventDefault();
                  let filtered = works.filter(i => {
                    let begin = dates.noUiSlider.get()[0];
                    let end = dates.noUiSlider.get()[1];
                    let lowest = tiers.noUiSlider.get()[0];
                    let highest = tiers.noUiSlider.get()[1];
                    if ((begin && i.year < begin) || (end && i.year > end) || (lowest && i.tier + 1 < lowest) || (highest && i.tier + 1 > highest))
                      return false;
                    return true;
                  });
                  let i = randomInteger(0, filtered.length - 1);
                  let piece = filtered[i];
                  document.getElementById("composer").textContent = piece.composer;
                  document.getElementById("title").textContent = smartquotes(piece.str);
                  document.getElementById("yt").href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(piece.composer + " " + piece.str);
                  document.getElementById("tier").textContent = "Tier " + piece.tier;
                  document.getElementById("year").textContent = piece.year ? "(" + piece.year + ")" : "";
                  document.getElementById("result").style.visibility = "visible";
                });
             });
