import { parse } from "node-html-parser";
import { loadOrDL } from "./lib/dl";

import * as mkdirp from "mkdirp";
import * as path from "path";

export default async function downloadPlanComMinutes() {
  const outDir = `data/dl-pc/`;
  mkdirp.sync(outDir);

  // First, download the meetings archive page
  const url = "https://sfplanning.org/cpc-hearing-archives";
  const filepath = path.join(outDir, "cpc-hearing-archives.html");
  const html = (await loadOrDL(filepath, url, "text/html")) as string;

  // Then, download all meeting minutes
  const dom = parse(html);
  const links = dom.querySelectorAll("a");
  console.log(`Found ${links.length} links`);
  for (const link of links) {
    let minutesUrl = "";
    if (link.textContent === "Agenda") {
      const agendaUrl = link.attributes["href"];
      const minName = path.basename(agendaUrl).substring(0, 8) + "_cal_min.pdf";
      minutesUrl = `https://commissions.sfplanning.org/cpcpackets/${minName}`;
      if (minName.includes("_cancel")) {
        minutesUrl = "";
      }
    } else if (link.textContent === "Minutes") {
      minutesUrl = link.attributes["href"];
    }
    if (minutesUrl === "") {
      continue;
    }
    if (!path.basename(minutesUrl).startsWith("20")) {
      break;
    }

    try {
      const pdfName = path.basename(minutesUrl);
      console.log(`Loading or downloading minutes ${pdfName}`);
      await loadOrDL(path.join(outDir, pdfName), minutesUrl, "application/pdf");
    } catch (e) {
      console.log(`Error, skipping ${minutesUrl}`);
    }
  }
}
