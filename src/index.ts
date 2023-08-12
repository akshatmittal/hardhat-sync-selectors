import axios from "axios";
import { task } from "hardhat/config";
import { HardhatPluginError } from "hardhat/plugins";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function action(args: any, hre: HardhatRuntimeEnvironment) {
  if (!args.noCompile) {
    await hre.run(TASK_COMPILE);
  }

  const allArtifactNames = await hre.artifacts.getAllFullyQualifiedNames();
  const fullComposite = await Promise.all(
    allArtifactNames.map((fullName) => hre.artifacts.readArtifact(fullName).then((e) => e.abi)),
  )
    .then((e) => e.flat())
    .then((e) => e.map((v) => [JSON.stringify(v), v] as const))
    .then((e) => [...new Map(e).values()]);

  const parsedComposite = fullComposite
    .filter((e) => ["function", "event", "error"].includes(e.type))
    .map((e) => {
      if (e.type === "error") {
        // errors are same as functions
        e.type = "function";
        e.outputs = [];
      }

      return e;
    });

  if (parsedComposite.length === 0) {
    throw new HardhatPluginError("hardhat-sync-selectors", "Nothing to sync!");
  }

  await axios
    .post("https://www.4byte.directory/api/v1/import-abi/", {
      contract_abi: JSON.stringify(parsedComposite),
    })
    .then(({ data }) => {
      console.log(
        `Processed ${data.num_processed} unique items from ${allArtifactNames.length} individual ABIs adding ${data.num_imported} new selectors to database with ${data.num_duplicates} duplicates and ${data.num_ignored} ignored items.`,
      );
    })
    .catch((error) => {
      throw new HardhatPluginError("hardhat-sync-selectors", `Sync failed with code ${error.response.status}!`);
    });

  console.log("Done!");
}

task("sync-selectors", "Upload function selectors")
  .addFlag("noCompile", "Sync without compiling first")
  .setAction(action);

task("sync-signatures", "Upload function signatures")
  .addFlag("noCompile", "Sync without compiling first")
  .setAction(action);
