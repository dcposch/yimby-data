import downloadPlanComMinutes from "./dl-pc";
import downloadPermitData from "./dl-permit-data";
import exportProjects from "./export-projects";
import parsePlanComMinutes from "./parse-pc";

async function main() {
  // await downloadPlanComMinutes();
  // await parsePlanComMinutes();
  await downloadPermitData();
  await exportProjects();
}
main()
  .then(() => console.log("Done"))
  .catch((e) => console.error(e));
