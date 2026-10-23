const assert=require('node:assert/strict');
const C=require('./dist/core.js');
let p=C.fresh();assert.equal(C.unlocked(p,'nyx'),true);assert.equal(C.unlocked(p,'mira'),false);
assert.equal(C.creditTime(p,599),0);assert.equal(p.shards,0);assert.equal(C.creditTime(p,2),1);assert.equal(p.activeSeconds,1);assert.equal(p.shards,1);
assert.equal(C.purchase(p,'or'),false);assert.equal(p.shards,1);C.creditTime(p,600);assert.equal(C.purchase(p,'or'),true);assert.equal(p.shards,0);assert.equal(p.skin,'or');assert.equal(C.purchase(p,'or'),false);assert.equal(C.purchase(p,'invalid'),false);
p.stats.shrines=12;p.stats.wins=3;p.stats.flawless=1;for(const id of Object.keys(C.characters))assert.equal(C.unlocked(p,id),true);
p.selected='umbra';const restored=C.normalize(JSON.parse(JSON.stringify(p)));assert.equal(restored.selected,'umbra');assert.equal(restored.skin,'or');assert.equal(restored.stats.shrines,12);
const corrupt=C.normalize({cj:-20,selected:'mira',stats:{wins:-2,collected:'oops'},owned:['bad'],skin:'bad'});assert.equal(corrupt.shards,0);assert.equal(corrupt.selected,'nyx');assert.equal(corrupt.stats.wins,0);assert.equal(corrupt.stats.collected,0);assert.equal(corrupt.skin,'aurore');assert.equal(C.challenges.length,10);
console.log('OK — économie, seuil CJ, achats, déblocages et sauvegardes.');
assert.deepEqual([0,1,2].map(C.offeringCost),[80,160,240]);
assert.equal(C.lightGain(24,1.5),25.5);assert(C.lightGain(180,12)-180<12);assert(C.lightGain(399,12)>400);
// Compatibility with an actual V0.3-shaped save: no currency or unlock reset.
const oldSave={version:1,cj:17,activeSeconds:598,selected:'umbra',skin:'givre',owned:['aurore','or','rose','givre'],stats:{runs:20,wins:8,shrines:26,collected:5000,absorbed:80,powers:65,flawless:2,fast:3,close:1,miraWins:2},sound:true};
const migrated=C.normalize(oldSave);assert.equal(migrated.shards,17);assert.deepEqual(migrated.owned,oldSave.owned);assert.equal(migrated.selected,'umbra');assert.equal(migrated.stats.fast,3);assert.equal(migrated.activeSeconds,598);assert.equal(C.creditTime(migrated,2),1);assert.equal(migrated.shards,18);assert(C.purchase(migrated,'invalid')===false);
const roundTrip=C.normalize(JSON.parse(JSON.stringify({...migrated,cj:migrated.shards})));assert.deepEqual(roundTrip,migrated);assert.equal(roundTrip.stats.bestSurvival,0);
console.log('OK migration — ancien solde, achats, personnages, défis et temps actif conservés sans connexion au Hub.');
