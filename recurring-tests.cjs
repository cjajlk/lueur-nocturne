const assert=require('node:assert/strict'),C=require('./dist/core.js'),R=require('./dist/recurring.js');
const at=s=>Date.parse(s),p=C.fresh(),start=at('2026-12-31T22:59:00Z');p.stats.collected=999999;R.rollover(p,start);assert(p.recurringChallenges.periods.daily.objectives.every(o=>o.progress===0));
for(let i=0;i<300;i++)R.action(p,'collected',start);for(let i=0;i<3;i++)R.action(p,'absorbed',start);assert.equal(R.pending(p).length,0);R.action(p,'shrines',start);assert.deepEqual(R.pending(p),[{id:'daily:2026-12-31',kind:'daily',reward:1}]);
let raw=C.serializeProfile(p);const storage={getItem:()=>raw,setItem:(k,v)=>raw=v};for(const a of R.pending(p)){const draft=JSON.parse(raw);draft.shards+=a.reward;const out=C.commitTransaction(p,draft,{id:a.id,kind:'reward',delta:a.reward},storage,raw);assert(out.ok);Object.assign(p,out.profile);}assert.equal(p.shards,1);assert.equal(R.pending(C.normalize(JSON.parse(raw))).length,0);
R.rollover(p,at('2026-12-31T23:00:00Z'));assert.equal(p.recurringChallenges.periods.daily.id,'2027-01-01');assert.equal(p.recurringChallenges.periods.monthly.id,'2027-01');assert.equal(p.recurringChallenges.periods.weekly.objectives[0].progress,300);
assert.equal(R.ids(at('2027-01-03T23:00:00Z')).weekly,'2027-01-04');
for(const [date,hours] of [['2026-03-28T23:00:00Z',23],['2026-10-24T22:00:00Z',25]])assert(Math.abs(R.remaining('daily',at(date))-hours*60)<=1);
const before=JSON.stringify(p.recurringChallenges);R.rollover(p,start);assert.equal(JSON.stringify(p.recurringChallenges),before,'clock rollback cannot reset progress');
for(const period of Object.values(p.recurringChallenges.periods))for(const o of period.objectives)o.progress=o.target;
assert.equal(R.pending(p).reduce((n,a)=>n+a.reward,0),7);assert.equal(C.challenges.length,10);
console.log('OK recurring: three periods, action-only progress, reload, atomic unique reward, midnight/week/year, 23h/25h DST days, clock rollback, permanent challenges.');

for(const a of R.pending(p)){const draft=JSON.parse(C.serializeProfile(p));draft.shards+=a.reward;const out=C.commitTransaction(p,draft,{id:a.id,kind:'reward',delta:a.reward},storage,raw);assert(out.ok);Object.assign(p,out.profile);}assert.equal(p.shards,8);assert.equal(R.pending(p).length,0);
