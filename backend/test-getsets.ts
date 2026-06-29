import { questionsService } from "./src/modules/questions/questions.service";

async function run() {
  try {
    const res = await questionsService.getSets();
    console.log("Success:", !!res);
    console.log("Keys:", Object.keys(res));
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
