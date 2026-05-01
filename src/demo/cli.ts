import { sampleTeams } from '../data/samplePlayers';
import { createInitialMatchState, simulateMatch } from '../engine/matchEngine';

const result = simulateMatch(createInitialMatchState(sampleTeams, 20260430));

console.log(`Winner: ${sampleTeams[result.winner].name}`);
console.log(`Sets: ${result.finalScore.sets.A}-${result.finalScore.sets.B}`);
console.log(`Completed sets: ${result.finalScore.completedSets.map((set) => `${set.A}-${set.B}`).join(', ')}`);
console.log('');

for (const entry of result.log) {
  console.log(`#${entry.pointNumber} ${entry.rally.log} -> ${entry.scoreLabel}`);
}
