import { fuse } from "../src/lib/fusion.ts";
const probs = [0.7969, 0.0199, 0.1324, 0.0508]; // Normal default
const thin = fuse(probs, { available: true, adiposity: -0.95, confidence: 0.8, build: "Kurus" });
const obese = fuse(probs, { available: true, adiposity: 0.9, confidence: 0.8, build: "Gemuk" });
const none = fuse(probs, { available: false, adiposity: 0, confidence: 0, build: "Normal" });
const sum = (a) => a.reduce((x, y) => x + y, 0);
console.log("thin : risk", (thin.riskBefore*100).toFixed(1), "->", (thin.riskAfter*100).toFixed(1), "shift", thin.shiftPP.toFixed(1), "dir", thin.direction, "sum", sum(thin.after).toFixed(4));
console.log("obese: risk", (obese.riskBefore*100).toFixed(1), "->", (obese.riskAfter*100).toFixed(1), "shift", obese.shiftPP.toFixed(1), "dir", obese.direction, "sum", sum(obese.after).toFixed(4));
console.log("none :", none);
let ok = thin.direction==="naik" && obese.direction==="turun" && none===null
  && Math.abs(sum(thin.after)-1)<1e-6 && Math.abs(sum(obese.after)-1)<1e-6
  && Math.abs(thin.shiftPP)<=10.01 && thin.after.every(p=>p>=0);
console.log(ok ? "FUSION OK" : "FUSION FAIL");
process.exit(ok?0:1);
