import * as fs from "fs";
import * as _ from "lodash";
import sequence from "../lib/sequenceGreedy";

const tracks = require("../tracks.json");

const out = sequence(tracks);
fs.writeFileSync("sequence.json", JSON.stringify(out, null, 2));
