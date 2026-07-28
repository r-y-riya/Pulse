import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from '../models/Exercise';

dotenv.config();

function generateExercises(): any[] {
  const list: any[] = [];
  
  // 1. CHEST VARIATIONS
  const chestAngles = ["Flat", "Incline", "Decline", "Floor", "Low-Incline", "High-Incline", "Smith-Machine"];
  const chestEquip = ["Barbell", "Dumbbell", "Cable", "Machine", "Kettlebell", "Banded"];
  const chestStyles = ["Press", "Fly", "Tempo Press", "Pause Press", "Unilateral Press", "Close-Grip Press", "Wide-Grip Press", "Neutral-Grip Press"];
  
  let count = 0;
  for (const angle of chestAngles) {
    for (const equip of chestEquip) {
      for (const style of chestStyles) {
        if (count >= 50) break;
        const name = `${angle} ${equip} ${style}`;
        list.push({
          name,
          category: equip === "Barbell" ? "strength" : "hypertrophy",
          bodyPart: "chest",
          equipment: equip.toLowerCase(),
          difficulty: angle.includes("Floor") || style.includes("Tempo") ? "intermediate" : "beginner",
          primaryMuscles: ["Chest"],
          secondaryMuscles: ["Shoulders", "Triceps"],
          instructions: [
            `Position yourself for the ${angle} movement. Hold the ${equip} securely.`,
            `Perform the ${style} motion with control, lowering toward your chest plane.`,
            "Squeeze your chest muscles at the peak of the contraction.",
            "Return to the starting position under full muscular tension."
          ],
          commonMistakes: [
            "Flaring elbows excessively.",
            "Losing shoulder blades retraction."
          ]
        });
        count++;
      }
      if (count >= 50) break;
    }
    if (count >= 50) break;
  }

  // 2. BACK VARIATIONS
  const backTypes = ["Lat Pulldown", "Chest-Supported Row", "Bent-Over Row", "Single-Arm Row", "Seated Cable Row", "T-Bar Row", "Pullover"];
  const backGrips = ["Pronated", "Supinated", "Neutral", "Wide-Grip", "Close-Grip", "Underhand", "Overhand"];
  const backEquip = ["Cable", "Dumbbell", "Barbell", "Machine", "Kettlebell", "Bodyweight"];
  
  count = 0;
  for (const type of backTypes) {
    for (const grip of backGrips) {
      for (const equip of backEquip) {
        if (count >= 50) break;
        const name = `${grip} ${equip} ${type}`;
        list.push({
          name,
          category: equip === "Barbell" ? "strength" : "hypertrophy",
          bodyPart: "back",
          equipment: equip.toLowerCase(),
          difficulty: grip.includes("Wide") ? "intermediate" : "beginner",
          primaryMuscles: ["Lats", "Upper Back"],
          secondaryMuscles: ["Biceps", "Rhomboids", "Rear Delts"],
          instructions: [
            `Setup the ${equip} for the ${grip} ${type}.`,
            "Initiate the movement by retracting your shoulder blades.",
            "Drive your elbows back and pull toward your torso.",
            "Extend your arms fully to stretch the lats at the end of the rep."
          ],
          commonMistakes: [
            "Using torso momentum to swing the weight.",
            "Shrugging shoulders instead of pulling with elbows."
          ]
        });
        count++;
      }
      if (count >= 50) break;
    }
    if (count >= 50) break;
  }

  // 3. LEGS VARIATIONS
  const legExercises = ["Squat", "Lunge", "Romanian Deadlift", "Leg Press", "Leg Extension", "Leg Curl", "Calf Raise", "Glute Bridge", "Step-Up"];
  const legStyles = ["Bulgarian", "Standard", "Front", "Back", "Goblet", "Deficit", "Tempo", "Pause", "Unilateral"];
  const legEquip = ["Barbell", "Dumbbell", "Kettlebell", "Machine", "Cable", "Smith-Machine"];
  
  count = 0;
  for (const ex of legExercises) {
    for (const style of legStyles) {
      for (const equip of legEquip) {
        if (count >= 50) break;
        const name = `${style} ${equip} ${ex}`;
        list.push({
          name,
          category: equip === "Barbell" ? "strength" : "hypertrophy",
          bodyPart: "legs",
          equipment: equip.toLowerCase(),
          difficulty: style.includes("Bulgarian") || ex.includes("Deadlift") ? "advanced" : "intermediate",
          primaryMuscles: ex.includes("Calf") ? ["Calves"] : ex.includes("Deadlift") || ex.includes("Curl") ? ["Hamstrings"] : ["Quadriceps", "Glutes"],
          secondaryMuscles: ["Core", "Lower Back"],
          instructions: [
            `Set up with the ${equip} for the ${style} ${ex}.`,
            "Brace your core and hinge/descend with control.",
            "Drive through the mid-foot/heels to push the load up.",
            "Exhale and stand tall, locking out the hips."
          ],
          commonMistakes: [
            "Knees caving inward.",
            "Rounded spine during hip hinge."
          ]
        });
        count++;
      }
      if (count >= 50) break;
    }
    if (count >= 50) break;
  }

  // 4. SHOULDERS VARIATIONS
  const shoulderMovements = ["Overhead Press", "Lateral Raise", "Front Raise", "Rear Delt Fly", "Upright Row", "Facepull"];
  const shoulderEquip = ["Barbell", "Dumbbell", "Cable", "Machine", "Kettlebell", "Banded"];
  const shoulderStance = ["Seated", "Standing", "Kneeling", "Single-Arm", "Incline", "Pause"];
  
  count = 0;
  for (const move of shoulderMovements) {
    for (const equip of shoulderEquip) {
      for (const stance of shoulderStance) {
        if (count >= 50) break;
        const name = `${stance} ${equip} ${move}`;
        list.push({
          name,
          category: equip === "Barbell" ? "strength" : "hypertrophy",
          bodyPart: "shoulders",
          equipment: equip.toLowerCase(),
          difficulty: stance.includes("Single") ? "intermediate" : "beginner",
          primaryMuscles: move.includes("Lateral") ? ["Side Delts"] : move.includes("Rear") ? ["Rear Delts"] : ["Front Delts"],
          secondaryMuscles: ["Triceps", "Traps"],
          instructions: [
            `Assume a ${stance} posture with the ${equip}.`,
            `Perform the ${move} motion, focusing on the target head of the deltoid.`,
            "Raise with control, avoiding using body momentum.",
            "Lower slowly to maintain constant muscle tension."
          ],
          commonMistakes: [
            "Shrugging shoulders up.",
            "Using body sway to swing the weight."
          ]
        });
        count++;
      }
      if (count >= 50) break;
    }
    if (count >= 50) break;
  }

  // 5. ARMS VARIATIONS
  const armMovements = ["Biceps Curl", "Hammer Curl", "Preacher Curl", "Triceps Pushdown", "Overhead Extension", "Skull Crusher", "EZ-Bar Extension"];
  const armEquip = ["Dumbbell", "Barbell", "Cable", "EZ-Bar", "Kettlebell", "Machine"];
  const armStance = ["Incline", "Seated", "Standing", "Concentration", "Spider", "Pronated", "Supinated"];
  
  count = 0;
  for (const move of armMovements) {
    for (const equip of armEquip) {
      for (const stance of armStance) {
        if (count >= 50) break;
        const name = `${stance} ${equip} ${move}`;
        list.push({
          name,
          category: "hypertrophy",
          bodyPart: "arms",
          equipment: equip.toLowerCase(),
          difficulty: "beginner",
          primaryMuscles: move.includes("Triceps") || move.includes("Overhead") || move.includes("Crusher") ? ["Triceps"] : ["Biceps"],
          secondaryMuscles: ["Forearms"],
          instructions: [
            `Get into the ${stance} position using the ${equip}.`,
            `Squeeze your arms to execute the ${move}.`,
            "Keep your elbows pinned in place to isolate the arm muscle.",
            "Fully extend your arm to get the maximum range of motion."
          ],
          commonMistakes: [
            "Moving the elbows forward, using shoulders.",
            "Rushing the eccentric phase."
          ]
        });
        count++;
      }
      if (count >= 50) break;
    }
    if (count >= 50) break;
  }

  // 6. CORE VARIATIONS
  const coreMovements = ["Crunch", "Plank", "Leg Raise", "Russian Twist", "Woodchopper", "Hanging Raise", "Ab Wheel Rollout"];
  const coreEquip = ["Bodyweight", "Cable", "Dumbbell", "Kettlebell", "Banded", "Medicine-Ball"];
  const coreStance = ["Decline", "Standard", "Incline", "Weighted", "Weighted Decline", "Slow-Tempo", "Isometric"];
  
  count = 0;
  for (const move of coreMovements) {
    for (const equip of coreEquip) {
      for (const stance of coreStance) {
        if (count >= 50) break;
        const name = `${stance} ${equip} ${move}`;
        list.push({
          name,
          category: "hypertrophy",
          bodyPart: "core",
          equipment: equip.toLowerCase(),
          difficulty: move.includes("Hanging") || move.includes("Wheel") ? "advanced" : "beginner",
          primaryMuscles: ["Abs"],
          secondaryMuscles: ["Obliques", "Hip Flexors"],
          instructions: [
            `Position yourself for the ${stance} ${move}.`,
            "Brace your transverse abdominis and core.",
            "Flex or rotate your torso under strict control.",
            "Avoid straining your neck; pull from your core."
          ],
          commonMistakes: [
            "Pulling with the hands behind the neck.",
            "Arching the lower back during loading."
          ]
        });
        count++;
      }
      if (count >= 50) break;
    }
    if (count >= 50) break;
  }

  return list;
}

export const seedDB = async (isStandalone: boolean = false) => {
  try {
    if (isStandalone) {
      const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/momentum_ai';
      await mongoose.connect(connStr);
      console.log("Connected to MongoDB for seeding...");
    }
    
    // Clear existing exercises
    await Exercise.deleteMany({});
    console.log("Cleared existing exercises.");

    const exercises = generateExercises();
    // Insert seeds
    await Exercise.insertMany(exercises);
    console.log(`Successfully seeded ${exercises.length} exercises (50 per muscle target)!`);
    
    if (isStandalone) {
      await mongoose.connection.close();
      console.log("Seeding connection closed.");
    }
  } catch (error) {
    console.error("Seeding failed:", error);
    if (isStandalone) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

// Run if called directly
if (require.main === module) {
  seedDB(true);
}
