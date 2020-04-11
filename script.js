var randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
var createSlider = (id, start, step, values, density) => {
	let e = document.getElementById(id);
	noUiSlider.create(e,{start,connect:true,step,range:{min:start[0],max:start[1]},pips:{mode:"values",values,density}});
	return e;
}
var dispElem = (id, disp) => document.getElementById(id).style.display = disp ? "block" : "none";
var setText = (id, text) => document.getElementById(id).textContent = text;

var works = [];
var dates = createSlider("date-range", [1000, 2020], 20, [...Array(11).keys()].map(x => (x + 10) * 100), 20/1020 * 100);
var tiers = createSlider("tier-range", [1, 108], 1, [1, ...[...Array(11).keys()].map(x => (x + 1) * 10), 108], 100/108);

fetch("https://docs.google.com/document/export?format=txt&id=18t_9MHZTENbmYdezAAj4LRM0-Eak_MYO1HssZW2FX1U")
	.then(r => r.text())
	.then(a => {
								let tier = -1;
								let lines = a.split(/\r?\n/);
								let main_part = false;
								let j;
								let tmp_comp = null;
								for (j = 0; j < lines.length; j++) {
									let line = lines[j];
									if (line.startsWith("The First"))
										main_part = true;
									else if (line.startsWith("The Absolute"))
										break;
									if (main_part) {
										if (line.startsWith("The")) {
											tier++;
										} else if (line) {
											let comp = line.slice(2, line.indexOf(":"));
											// handle case of indents (see first tier)
											if (lines[j+1][0] === " " && !tmp_comp) {
												tmp_comp = comp;
											} else {
												if (line[0] === " ") {
													comp = tmp_comp;
													line = line.trim();
												} else {
													tmp_comp = null;
												}
												let year_str = line.slice(line.lastIndexOf("["));
												let year = year_str.match(/\d{4}/);
												if (!year && year_str.includes("cent"))
													year = year_str.match(/\d{2}/) * 100;
												let title = line.slice(line.indexOf(":") + 2, year ? (line.lastIndexOf("[") - 1) : undefined);
												works.push({title, year, comp, tier});
											}
										}
									}
								}
								dispElem("rng", true);
								dispElem("info", false);
								document.getElementById("rng").addEventListener("submit", function(event) {
									event.preventDefault();
									let filtered = works.filter(i => {
										let [begin, end] = dates.noUiSlider.get();
										let [lowest, highest] = tiers.noUiSlider.get();
										return !((begin != 1000 || end != 2020) && ((i.year < begin) || (i.year > end)) || (i.tier + 1 < lowest) || (i.tier + 1 > highest));
									});
									let piece = filtered[randInt(0, filtered.length - 1)];
									if (piece) {
										dispElem("info", false);
										setText("composer", piece.comp);
										setText("title", smartquotes(piece.title));
										document.getElementById("yt").href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(piece.comp + " " + piece.title);
										setText("tier", "Tier " + piece.tier);
										setText("year", piece.year ? "(" + piece.year + ")" : "");
										dispElem("result", true);
									} else {
										dispElem("result", false);
										setText("info", "No results found.");
										dispElem("info", true);
									}
									document.getElementById("trigger").blur();
								});
							});
