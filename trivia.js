import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

/**
 * Array of trivia question objects containing questions, options, and correct option indices.
 */
const quizQuestions = [
  {
    id: 1,
    question: "Which JavaScript keyword is used to declare a constant variable?",
    options: ["1. var", "2. let", "3. const", "4. static"],
    correct: 3
  },
  {
    id: 2,
    question: "Which array method creates a new array with all elements that pass a test?",
    options: ["1. map()", "2. filter()", "3. reduce()", "4. forEach()"],
    correct: 2
  },
  {
    id: 3,
    question: "What data type is the result of typeof NaN in JavaScript?",
    options: ["1. undefined", "2. number", "3. NaN", "4. object"],
    correct: 2
  },
  {
    id: 4,
    question: "Which symbol is used for single-line comments in JavaScript?",
    options: ["1. <!-- -->", "2. /* */", "3. //", "4. #"],
    correct: 3
  }
];

/**
 * Asynchronously prompts the user with a time limit using Promise.race and timers.
 * 
 * @param {readline.Interface} rl - The readline interface instance
 * @param {Object} questionObj - The current trivia question object
 * @param {number} timeLimitSeconds - Allowed time per question in seconds
 * @returns {Promise<string|null>} - Returns user input string or null if time expired
 */
const askQuestionWithTimer = async (rl, questionObj, timeLimitSeconds = 10) => {
  console.log(`\n--- Question ${questionObj.id} of ${quizQuestions.length} ---`);
  console.log(questionObj.question);
  questionObj.options.forEach(option => console.log(option));
  console.log(`[⏱️ Time limit: ${timeLimitSeconds} seconds to answer]`);

  let timerId;
  const promptPromise = rl.question("Your choice (enter option number): ");
  
  const timeoutPromise = new Promise((resolve) => {
    timerId = setTimeout(() => {
      resolve(null); // Triggers timeout
    }, timeLimitSeconds * 1000);
  });

  const answer = await Promise.race([promptPromise, timeoutPromise]);
  clearTimeout(timerId); // Clear timer once user answers or time runs out
  return answer;
};

/**
 * Main function to start and manage the CLI quiz game.
 */
async function runQuiz() {
  const rl = readline.createInterface({ input, output });

  console.log("========================================");
  console.log("       WELCOME TO THE CLI TRIVIA!       ");
  console.log("========================================");
  
  try {
    const startPrompt = await rl.question("Ready to start the quiz? (y/n): ");
    if (startPrompt.trim().toLowerCase() !== 'y') {
      console.log("Quiz cancelled. Goodbye!");
      rl.close();
      return;
    }

    const results = [];
    const gameStartTime = Date.now();

    // Sequential loop through quiz questions
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      const userAnswerStr = await askQuestionWithTimer(rl, q, 10);

      let isCorrect = false;
      let timedOut = false;

      if (userAnswerStr === null) {
        timedOut = true;
        console.log("\n⌛ Time's up! You ran out of time for this question.");
      } else {
        const userAnswer = parseInt(userAnswerStr.trim(), 10);
        if (userAnswer === q.correct) {
          isCorrect = true;
          console.log("✅ Correct!");
        } else {
          console.log(`❌ Incorrect! The correct answer was option ${q.correct}.`);
        }
      }

      // Store results in an array for evaluation
      results.push({
        questionId: q.id,
        timedOut,
        isCorrect,
        userAnswer: userAnswerStr ? parseInt(userAnswerStr.trim(), 10) : null
      });
    }

    const gameEndTime = Date.now();
    const totalDurationSeconds = Math.round((gameEndTime - gameStartTime) / 1000);

    rl.close();

    // --- Array Iteration Methods Usage ---
    // Using Array.reduce() to compute the total correct answers
    const correctCount = results.reduce((acc, curr) => (curr.isCorrect ? acc + 1 : acc), 0);
    const totalQuestions = quizQuestions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    // Using Array.filter() to extract incorrect answers for review feedback
    const incorrectAnswers = results.filter(r => !r.isCorrect);

    // --- Game Over Feedback ---
    console.log("\n========================================");
    console.log("              GAME OVER!                ");
    console.log("========================================");
    console.log(`⏱️ Total Time Taken: ${totalDurationSeconds} seconds`);
    console.log(`📊 Final Score: ${correctCount} / ${totalQuestions} (${scorePercentage}%)`);

    if (correctCount === totalQuestions) {
      console.log("🌟 Excellent work! You got a perfect score!");
    } else if (correctCount >= totalQuestions / 2) {
      console.log("👍 Good job! You passed the quiz successfully.");
    } else {
      console.log("💡 Keep practicing your JavaScript fundamentals and try again!");
    }

    if (incorrectAnswers.length > 0) {
      console.log(`\nReview Note: You missed ${incorrectAnswers.length} question(s). Keep brushing up on those topics!`);
    }
    console.log("========================================");

  } catch (error) {
    console.error("An unexpected error occurred during the quiz:", error);
    rl.close();
  }
}

// Execute the application
runQuiz();