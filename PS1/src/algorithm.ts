/**
 * Problem Set 1: Flashcards - Algorithm Functions
 *
 * This file contains the implementations for the flashcard algorithm functions
 * as described in the problem set handout.
 *
 * Please DO NOT modify the signatures of the exported functions in this file,
 * or you risk failing the autograder.
 */

import { Flashcard, AnswerDifficulty, BucketMap } from "./flashcards";

/**
 * Converts a Map representation of learning buckets into an Array-of-Set representation.
 *
 * @param buckets Map where keys are bucket numbers and values are sets of Flashcards.
 * @returns Array of Sets, where element at index i is the set of flashcards in bucket i.
 *          Buckets with no cards will have empty sets in the array.
 * @spec.requires buckets is a valid representation of flashcard buckets.
 */
export function toBucketSets(buckets: BucketMap): Array<Set<Flashcard>> {
  if (buckets.size === 0) {
    return [];
  }


  let bucketsArray: Array<Set<Flashcard>> = [];

  for (let i = 0; i < buckets.size; i++) {
    bucketsArray.push(buckets.get(i) || new Set());
  }
  return bucketsArray;
;
}

/**
 * Finds the range of buckets that contain flashcards, as a rough measure of progress.
 *
 * @param buckets Array-of-Set representation of buckets.
 * @returns object with minBucket and maxBucket properties representing the range,
 *          or undefined if no buckets contain cards.
 * @spec.requires buckets is a valid Array-of-Set representation of flashcard buckets.
 */
export function getBucketRange(
  buckets: Array<Set<Flashcard>>
): { minBucket: number; maxBucket: number } | undefined {

  if (buckets.length === 0) {
    return undefined;
  }

  let minBucket = undefined;
  let maxBucket = 0;


  for (let i = 0; i < buckets.length; i++) {
    const bucket = buckets[i];
    if (bucket && bucket.size > 0) {
      minBucket= i;
      break;
    }
  }

  if (minBucket === undefined) {
    return undefined;
  }
  

  for (let i = buckets.length - 1; i >= 0; i--) {
    const bucket=buckets[i]
    if (bucket && bucket.size > 0) {
      maxBucket = i;
      break;
    }
  }
  return { minBucket, maxBucket };
}

/**
 * Selects cards to practice on a particular day.
 *
 * @param buckets Array-of-Set representation of buckets.
 * @param day current day number (starting from 0).
 * @returns a Set of Flashcards that should be practiced on day `day`,
 *          according to the Modified-Leitner algorithm.
 * @spec.requires buckets is a valid Array-of-Set representation of flashcard buckets.
 */
export function practice(
  buckets: Array<Set<Flashcard>>,
  day: number
): Set<Flashcard> {
  const arr= new Set<Flashcard>();
  for(let i = 0; i < buckets.length; i++){
    const bucket = buckets[i]


    if (bucket && bucket.size === 0) {
      continue;
    }


    if(day %Math.pow(2,i) === 0){
      bucket?.forEach(Flashcard=>{
        arr.add(Flashcard)
      });
        
    }
  }
  return arr;
}

/**
 * Updates a card's bucket number after a practice trial.
 *
 * @param buckets Map representation of learning buckets.
 * @param card flashcard that was practiced.
 * @param difficulty how well the user did on the card in this practice trial.
 * @returns updated Map of learning buckets.
 * @spec.requires buckets is a valid representation of flashcard buckets.
 */
export function update(
  buckets: BucketMap,
  card: Flashcard,
  difficulty: AnswerDifficulty
): BucketMap {
  let currentBucket: number | null = null;


  for (const [bucketNumber, bucket] of buckets.entries()) {
    if (bucket.has(card)) {
      currentBucket = bucketNumber;
      bucket.delete(card);
      break;
    }
  }

  if (currentBucket === null) {
    return buckets;
  }

  let newBucket = currentBucket;

  if (difficulty === AnswerDifficulty.Wrong) {
    newBucket = 0;
  } else if (difficulty === AnswerDifficulty.Easy) {
    newBucket = currentBucket + 1;
  } else if (difficulty === AnswerDifficulty.Hard && currentBucket > 0) {
    newBucket = currentBucket - 1;
  }

  if (!buckets.has(newBucket)) {
    buckets.set(newBucket, new Set());
  }
  
  buckets.get(newBucket)!.add(card);
  return buckets;
}

/**
 * Generates a hint for a flashcard.
 *
 * @param card flashcard to hint
 * @returns a hint for the front of the flashcard.
 * @spec.requires card is a valid Flashcard.
 */
export function getHint(card: Flashcard): string {
  if (card.hint.length===0){
    return card.front[0]!;
  }
  else{
    return card.hint;
  }

  
}
type computeProgressType = {
  minBucket: number;
  maxBucket: number;
  easyCount: number;
  hardCount: number;
  wrongCount: number;
}

/**
 * Computes statistics about the user's learning progress.
 *
 * @param buckets representation of learning buckets.
 * @param history representation of user's answer history.
 * @returns statistics about learning progress stired as type conputeProgressType.
 * - If `buckets` or `history` are empty, return default values with an appropriate message.
 */
export function computeProgress(buckets: any, history: any): any {
  // Replace 'any' with appropriate types
  // TODO: Implement this function (and define the spec!)

  const result: computeProgressType = {
    minBucket: 0,
    maxBucket: 0,
    easyCount: 0,
    hardCount: 0,
    wrongCount: 0,
  }


  if (buckets.size === 0 || Object.keys(history).length === 0) {
    if (buckets.size > 0) {
      const bucketKeys = Array.from(buckets.keys()) as number[]; 
      result.minBucket = Math.min(...bucketKeys);
      result.maxBucket = Math.max(...bucketKeys);
    }
    return result;
  }

  for (const answers of Object.values(history) as AnswerDifficulty[][]) {
    for (const answer of answers) {
      if (answer === AnswerDifficulty.Wrong) {
        result.wrongCount++;
      } else if (answer === AnswerDifficulty.Easy) {
        result.easyCount++;
      } else if (answer === AnswerDifficulty.Hard) {
        result.hardCount++;
      }
    }
  }

  const bucketKeys = Array.from(buckets.keys()) as number[]; 
  result.minBucket = Math.min(...bucketKeys);
  result.maxBucket = Math.max(...bucketKeys);


  return result;
}
  


