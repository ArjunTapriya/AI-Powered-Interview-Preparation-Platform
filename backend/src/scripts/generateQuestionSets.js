const fs = require('fs');
const path = require('path');

const generateSet = (setId, easyCount, mediumCount, hardCount) => {
  const questions = [];
  let idCounter = 1;

  const addQuestions = (count, difficulty, setNum) => {
    for (let i = 0; i < count; i++) {
      questions.push({
        id: `set${setNum}-${difficulty.toLowerCase()}-${idCounter}`,
        title: `Mock ${difficulty} Challenge ${idCounter}`,
        category: "DSA",
        difficulty: difficulty,
        timeLimit: difficulty === "Easy" ? 20 : difficulty === "Medium" ? 30 : 45,
        description: `This is an auto-generated ${difficulty.toLowerCase()} mock question for Set ${setNum}.\n\nGiven an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.`,
        codeTemplate: `function solveQuestion(nums: number[], target: number): number[] {\n    // Implement solution here\n    return [];\n}`,
        optimalCode: `function solveQuestion(nums: number[], target: number): number[] {\n    return [0, 1];\n}`,
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
          }
        ],
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists."
        ]
      });
      idCounter++;
    }
  };

  addQuestions(easyCount, "Easy", setId);
  addQuestions(mediumCount, "Medium", setId);
  addQuestions(hardCount, "Hard", setId);

  return questions;
};

const main = () => {
  console.log("Generating Set 1 (70 Easy, 20 Medium, 11 Hard)...");
  const set1 = generateSet(1, 70, 20, 11);

  console.log("Generating Set 2 (50 Easy, 35 Medium, 16 Hard)...");
  const set2 = generateSet(2, 50, 35, 16);

  console.log("Generating Set 3 (40 Easy, 30 Medium, 31 Hard)...");
  const set3 = generateSet(3, 40, 30, 31);

  const data = {
    set1,
    set2,
    set3
  };

  const outputDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outPath = path.join(outputDir, 'question_sets.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`Saved 303 questions to ${outPath}`);
};

main();
