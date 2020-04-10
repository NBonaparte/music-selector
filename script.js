var tiers = [];
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
                        tiers.push({str: title,
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
                  let filtered = tiers.filter(i => {
                    let begin = document.getElementById("begin").value;
                    let end = document.getElementById("end").value;
                    let lowest = document.getElementById("lowest").value;
                    let highest = document.getElementById("highest").value;
                    if ((begin && i.year < begin) || (end && i.year > end) || (lowest && i.tier + 1 < lowest) || (highest && i.tier + 1 > highest))
                      return false;
                    return true;
                  });
                  let i = randomInteger(0, filtered.length - 1);
                  let piece = filtered[i];
                  document.getElementById("composer").textContent = piece.composer;
                  document.getElementById("title").textContent = piece.str;
                  document.getElementById("yt").href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(piece.composer + " " + piece.str);
                  document.getElementById("tier").textContent = "Tier " + piece.tier;
                  document.getElementById("year").textContent = piece.year ? "(" + piece.year + ")" : "";
                  document.getElementById("result").style.visibility = "visible";
                });
             });