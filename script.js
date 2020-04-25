var randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
var createSlider = (id, start, step, values, density) => {
	let e = document.getElementById(id);
	noUiSlider.create(e,{start,connect:true,step,range:{min:start[0],max:start[1]},pips:{mode:"values",values,density}});
	return e;
}
var dispElem = (id, disp) => {
	document.getElementById(id).style.opacity = disp ? 1 : 0;
	document.getElementById(id).style.height = !disp && id == "info" ? 0 : "auto";
};
var setText = (id, text) => document.getElementById(id).textContent = text;
var works = [];
var filtered = [];
var searchBtn = document.getElementById("trigger");

fetch("https://docs.google.com/document/export?format=txt&id=18t_9MHZTENbmYdezAAj4LRM0-Eak_MYO1HssZW2FX1U")
	.then(r => r.text())
	.then(a => {
		let tier = -1;
		let lines = a.split(/\r?\n/);
		let main_part = false;
		let j;
		let min_year = 2020;
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
						if (year && min_year > year)
							min_year = year;
						let title = line.slice(line.indexOf(":") + 2, year ? (line.lastIndexOf("[") - 1) : undefined);
						works.push({title, year, comp, tier});
					}
				}
			}
		}
		min_year = Math.floor(min_year/100)*100;
		cur_year = new Date().getFullYear();
		let dates = createSlider("date-range", [min_year, cur_year], 20, [...Array(11).keys()].map(x => (x + min_year/100) * 100), 2000/(cur_year - min_year));
		let tiers = createSlider("tier-range", [1, tier + 1], 1, [1, ...[...Array(11).keys()].map(x => (x + 1) * 10), tier + 1], 100/(tier + 1));
		let filterWorks = (date_range, tier_range) => {
			filtered = works.filter(i => {
				let [begin, end] = date_range;
				let [lowest, highest] = tier_range;
				return !((begin != min_year || end != cur_year) && ((i.year < begin) || (i.year > end)) || (i.tier + 1 < lowest) || (i.tier + 1 > highest));
			});
			document.getElementById("count").textContent = filtered.length;
		};
		filterWorks(dates.noUiSlider.get(), tiers.noUiSlider.get());
		dispElem("rng", true);
		dispElem("info", false);
		dates.noUiSlider.on("set", new_dates => filterWorks(new_dates, tiers.noUiSlider.get()));
		tiers.noUiSlider.on("set", new_tiers => filterWorks(dates.noUiSlider.get(), new_tiers));
		searchBtn.addEventListener("mouseleave", e => e.target.blur());
		document.addEventListener("touchstart", e => {if (e.target != searchBtn) searchBtn.blur()});
		document.getElementById("rng").addEventListener("submit", function(event) {
			event.preventDefault();
			dispElem("result", false);
			let piece = filtered[randInt(0, filtered.length - 1)];
			if (piece) {
				setTimeout(() => {
					dispElem("info", false);
					setText("composer", piece.comp);
					setText("title", smartquotes(piece.title));
					document.getElementById("yt").href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(piece.comp + " " + piece.title);
					setText("tier", piece.tier);
					setText("year", piece.year ? "(" + piece.year + ")" : "");
					dispElem("result", true);
					window.scrollTo({left: 0, top: document.body.scrollHeight, behavior: "smooth"});
				}, 300);
			} else {
				setText("info", "No results found.");
				setTimeout(() => {
					dispElem("info", true);
					document.getElementById("result").style.height = 0;
				}, 300);
			}
		});
	});
