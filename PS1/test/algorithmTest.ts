import assert from "assert";
import { AnswerDifficulty, Flashcard, BucketMap } from "../src/flashcards";
import {
  toBucketSets,
  getBucketRange,
  practice,
  update,
  getHint,
  computeProgress,
} from "../src/algorithm";

/*
 * Testing strategy for toBucketSets():
 *
 * TODO: Describe your testing strategy for toBucketSets() here.
 */
describe("toBucketSets()", () => {
  it("should convert a BucketMap to an array of Sets'", () => {
    const card1 = new Flashcard('front1', 'back1', 'hint1', ['tag1']);
    const card2 = new Flashcard('front2', 'back2', 'hint2', ['tag2']);
    const card3 = new Flashcard('front3', 'back3', 'hint3', ['tag3']);
    
    const bucketMap: BucketMap = new Map();
    bucketMap.set(0, new Set([card1]));
    bucketMap.set(1, new Set([card2]));
    bucketMap.set(2, new Set([card3]));

    const result=toBucketSets(bucketMap);

    assert(result[0] !== undefined, 'First set should exist');
    assert(result[0] instanceof Set, 'First set should be a Set');
    assert(result[0].has(card1), 'First set should contain card1');
    
    assert(result[1] !== undefined, 'Second set should exist');
    assert(result[1] instanceof Set, 'Second set should be a Set');
    assert(result[1].has(card2), 'Second set should contain card2');
    
    assert(result[2] !== undefined, 'Third set should exist');
    assert(result[2] instanceof Set, 'Third set should be a Set');
    assert(result[2].has(card3), 'Third set should contain card3');
    

  });


  it('should handle empty buckets', () => {
    // Setup
    const card1 = new Flashcard('front1', 'back1', 'hint1', ['tag1']);
    const bucketMap: BucketMap = new Map();
    bucketMap.set(0, new Set([card1]));
    bucketMap.set(1, new Set());
    bucketMap.set(2, new Set());
    
    // Execute
    const result = toBucketSets(bucketMap);
    
    // Assert
    assert.strictEqual(result.length, 3, 'Result should have 3 items');
    
    assert(result[0] !== undefined, 'First set should exist');
    assert.strictEqual(result[0].size, 1, 'First set should have 1 card');
    
    assert(result[1] !== undefined, 'Second set should exist');
    assert.strictEqual(result[1].size, 0, 'Second set should be empty');
    
    assert(result[2] !== undefined, 'Third set should exist');
    assert.strictEqual(result[2].size, 0, 'Third set should be empty');
  });

});

/*
 * Testing strategy for getBucketRange():
 *
 * TODO: Describe your testing strategy for getBucketRange() here.
 */
describe("getBucketRange()", () => {
  it("should return undefined for empty bucket array", () => {
    const emptyBuckets: Array<Set<Flashcard>> = [];
    const result = getBucketRange(emptyBuckets);
    assert.strictEqual(result, undefined, "Should return undefined for empty array");
  });

  it("should return undefined when all buckets are empty", () => {
    const emptyBuckets: Array<Set<Flashcard>> = [
      new Set(), new Set(), new Set()
    ];
    const result = getBucketRange(emptyBuckets);
    assert.strictEqual(result, undefined, "Should return undefined when all buckets are empty");
  });

  it("should return correct range when only one bucket has cards", () => {
    const card = new Flashcard("front", "back", "hint", ["tag"]);
    const buckets: Array<Set<Flashcard>> = [
      new Set(), new Set([card]), new Set()
    ];
    
    const result = getBucketRange(buckets);
    assert(result !== undefined, "Result should not be undefined");
    assert.strictEqual(result?.minBucket, 1, "Min bucket should be 1");
    assert.strictEqual(result?.maxBucket, 1, "Max bucket should be 1");
  });

  it("should return correct range when multiple buckets have cards", () => {
    const card1 = new Flashcard("front1", "back1", "hint1", ["tag1"]);
    const card2 = new Flashcard("front2", "back2", "hint2", ["tag2"]);
    const card3 = new Flashcard("front3", "back3", "hint3", ["tag3"]);
    
    const buckets: Array<Set<Flashcard>> = [
      new Set([card1]), 
      new Set(), 
      new Set([card2]), 
      new Set([card3])
    ];
    
    const result = getBucketRange(buckets);
    assert(result !== undefined, "Result should not be undefined");
    assert.strictEqual(result?.minBucket, 0, "Min bucket should be 0");
    assert.strictEqual(result?.maxBucket, 3, "Max bucket should be 3");
  });

  it("should handle first and last buckets having cards", () => {
    const card1 = new Flashcard("front1", "back1", "hint1", ["tag1"]);
    const card2 = new Flashcard("front2", "back2", "hint2", ["tag2"]);
    
    const buckets: Array<Set<Flashcard>> = [
      new Set([card1]), 
      new Set(), 
      new Set(),
      new Set([card2])
    ];
    
    const result = getBucketRange(buckets);
    assert(result !== undefined, "Result should not be undefined");
    assert.strictEqual(result?.minBucket, 0, "Min bucket should be 0");
    assert.strictEqual(result?.maxBucket, 3, "Max bucket should be 3");
  });

  it("should handle case when only the first bucket has cards", () => {
    const card = new Flashcard("front", "back", "hint", ["tag"]);
    const buckets: Array<Set<Flashcard>> = [
      new Set([card]), 
      new Set(), 
      new Set()
    ];
    
    const result = getBucketRange(buckets);
    assert(result !== undefined, "Result should not be undefined");
    assert.strictEqual(result?.minBucket, 0, "Min bucket should be 0");
    assert.strictEqual(result?.maxBucket, 0, "Max bucket should be 0");
  });

  it("should handle case when only the last bucket has cards", () => {
    const card = new Flashcard("front", "back", "hint", ["tag"]);
    const buckets: Array<Set<Flashcard>> = [
      new Set(), 
      new Set(), 
      new Set([card])
    ];
    
    const result = getBucketRange(buckets);
    assert(result !== undefined, "Result should not be undefined");
    assert.strictEqual(result?.minBucket, 2, "Min bucket should be 2");
    assert.strictEqual(result?.maxBucket, 2, "Max bucket should be 2");
  });

  it("should handle sparse distribution of cards", () => {
    const card1 = new Flashcard("front1", "back1", "hint1", ["tag1"]);
    const card2 = new Flashcard("front2", "back2", "hint2", ["tag2"]);
    
    const buckets: Array<Set<Flashcard>> = [
      new Set(), 
      new Set([card1]), 
      new Set(),
      new Set(),
      new Set(),
      new Set([card2]),
      new Set()
    ];
    
    const result = getBucketRange(buckets);
    assert(result !== undefined, "Result should not be undefined");
    assert.strictEqual(result?.minBucket, 1, "Min bucket should be 1");
    assert.strictEqual(result?.maxBucket, 5, "Max bucket should be 5");
  });
});

/*
 * Testing strategy for practice():
 *
 * TODO: Describe your testing strategy for practice() here.
 */
describe("practice function", () => {
  it("returns empty set when all buckets are empty", () => {
    assert.deepStrictEqual(practice([new Set(), new Set(), new Set()], 0), new Set());
  });

  it("selects flashcards from correct buckets based on day", () => {
    const cardA = new Flashcard("Q1", "A1", "Hint1", ["tag1"]);
    const cardB = new Flashcard("Q2", "A2", "Hint2", ["tag2"]);
    const cardC = new Flashcard("Q3", "A3", "Hint3", ["tag3"]);
    const cardD = new Flashcard("Q4", "A4", "Hint4", ["tag4"]);
    
    const buckets = [
      new Set([cardA]), // Appears every day (2^0 = 1)
      new Set([cardB]), // Appears on even days (2^1 = 2)
      new Set([cardC, cardD]), // Appears every 4 days (2^2 = 4)
    ];

    assert.deepStrictEqual(practice(buckets, 0), new Set([cardA, cardB, cardC, cardD]));
    assert.deepStrictEqual(practice(buckets, 1), new Set([cardA]));
    assert.deepStrictEqual(practice(buckets, 2), new Set([cardA, cardB]));
    assert.deepStrictEqual(practice(buckets, 3), new Set([cardA]));
    assert.deepStrictEqual(practice(buckets, 4), new Set([cardA, cardB, cardC, cardD]));
  });


  it("does not duplicate cards", () => {
    const cardY = new Flashcard("Q6", "A6", "Hint6", ["tag6"]);
    const buckets = [new Set([cardY]), new Set([cardY])];
    assert.deepStrictEqual(practice(buckets, 0), new Set([cardY]));
  });
});

/*
 * Testing strategy for update():
 *
 * TODO: Describe your testing strategy for update() here.
 */
describe("update()", () => {
  it("moves card to bucket 0 if answered Wrong", () => {
    const card = new Flashcard("Q1", "A1", "Hint1", ["tag1"]);
    const buckets = new Map([
      [1, new Set([card])]
    ]);

    const updatedBuckets = update(buckets, card, AnswerDifficulty.Wrong);
    assert.strictEqual(updatedBuckets.get(0)?.has(card), true);
    assert.strictEqual(updatedBuckets.get(1)?.has(card), false);
  });

  it("moves card to next bucket if answered Easy", () => {
    const card = new Flashcard("Q2", "A2", "Hint2", ["tag2"]);
    const buckets = new Map([
      [0, new Set([card])]
    ]);

    const updatedBuckets = update(buckets, card, AnswerDifficulty.Easy);
    assert.strictEqual(updatedBuckets.get(1)?.has(card), true);
    assert.strictEqual(updatedBuckets.get(0)?.has(card), false);
  });

  it("creates next bucket if it doesn't exist when answered Easy", () => {
    const card = new Flashcard("Q3", "A3", "Hint3", ["tag3"]);
    const buckets = new Map([
      [0, new Set([card])]
    ]);

    const updatedBuckets = update(buckets, card, AnswerDifficulty.Easy);
    assert.strictEqual(updatedBuckets.has(1), true);
    assert.strictEqual(updatedBuckets.get(1)?.has(card), true);
  });

  it("moves card to previous bucket if answered Hard", () => {
    const card = new Flashcard("Q4", "A4", "Hint4", ["tag4"]);
    const buckets = new Map([
      [2, new Set([card])]
    ]);

    const updatedBuckets = update(buckets, card, AnswerDifficulty.Hard);
    assert.strictEqual(updatedBuckets.get(1)?.has(card), true);
    assert.strictEqual(updatedBuckets.get(2)?.has(card), false);
  });

  it("does not move card below bucket 0 if Hard is answered", () => {
    const card = new Flashcard("Q5", "A5", "Hint5", ["tag5"]);
    const buckets = new Map([
      [0, new Set([card])]
    ]);

    const updatedBuckets = update(buckets, card, AnswerDifficulty.Hard);
    assert.strictEqual(updatedBuckets.get(0)?.has(card), true);
  });
});

/*
 * Testing strategy for getHint():
 *
 * TODO: Describe your testing strategy for getHint() here.
 */
describe("getHint()", () => {
  it("test case when hint is not empty", () => {
    const card = new Flashcard("Q6", "A6", "it is a hint", ["tag6"]);
    assert.strictEqual(getHint(card), "it is a hint");
  });

  it("test case when hint is empty-it should show first word of what is written in back", () => {
    const card = new Flashcard("Q6", "A6", "", ["tag6"]);
    assert.strictEqual(getHint(card), "Q");
  });
});

/*
 * Testing strategy for computeProgress():
 *
 * TODO: Describe your testing strategy for computeProgress() here.
 */
describe("computeProgress()", () => {  
  it("returns default values when buckets and history are empty", () => {  
    const buckets: BucketMap = new Map();  
    const history: Record<string, AnswerDifficulty[]> = {};  

    const result = computeProgress(buckets, history);
    assert.deepStrictEqual(result, {  
      minBucket: 0,  
      maxBucket: 0,  
      easyCount: 0,  
      hardCount: 0,  
      wrongCount: 0,  
    });  
  });  

  it("calculates correct bucket range and difficulty counts", () => {  
    const card1 = new Flashcard("Q1", "A1", "", []);  
    const card2 = new Flashcard("Q2", "A2", "", []);  
    const card3 = new Flashcard("Q3", "A3", "", []);  

    const buckets: BucketMap = new Map([  
      [0, new Set([card1])],  
      [2, new Set([card2])],  
      [3, new Set([card3])],  
    ]);  

    const history: Record<string, AnswerDifficulty[]> = {  
      Q1: [AnswerDifficulty.Wrong],  
      Q2: [AnswerDifficulty.Hard],  
      Q3: [AnswerDifficulty.Easy],  
    };  

    const result = computeProgress(buckets, history);
    assert.deepStrictEqual(result, {  
      minBucket: 0,  
      maxBucket: 3,  
      easyCount: 1,  
      hardCount: 1,  
      wrongCount: 1,  
    });  
  });  

  it("handles missing cards in history", () => {  
    const card1 = new Flashcard("Q1", "A1", "", []);  

    const buckets: BucketMap = new Map([[1, new Set([card1])]]);  
    const history: Record<string, AnswerDifficulty[]> = {};  

    const result = computeProgress(buckets, history);
    assert.deepStrictEqual(result, {  
      minBucket: 1,  
      maxBucket: 1,  
      easyCount: 0,  
      hardCount: 0,  
      wrongCount: 0,  
    });  
  });  
});
