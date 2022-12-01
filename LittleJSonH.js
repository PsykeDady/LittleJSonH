const cronExprOrdinal = {
	MINUTES: 0,
	HOURS: 1,
	DAY_OF_MONTH: 2,
	MONTH: 3,
	DAY_OF_WEEK: 4
}

const ERR_TEXT_WRONG_CRON = "ERROR= can't parse this string"

const CRON_EXPR_ORDER = ["minute", "hour", "day of month", "month", "day of week"]

const WORDLIST_MONTH = "\0\0\0JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC"; // \0\0\0 is added to match range 1-12
const WORDLIST_DAY_OF_WEEK = "SUNMONTUEWEDTHUFRISAT";

const MAX_YEAR_TRY = 4;

class LittleJSonH {
	_cronexpr = "";
	_minutes = [] // 60
	_hours = [] // 24
	_daysOfMonth = [] // 31
	_month = [] // 12
	_daysOfWeek = [] // 7

	currentTime = new Date()
	human = ""

	/**
		* 
		* @param {string} cron 
		*/
	constructor(cron) {
		if (cron == null || typeof(cron)!=="string" || cron === "") {
			throw ERR_TEXT_WRONG_CRON
		}
		this._cronexpr = cron.trim();
		let splitCron = cron.split(" ");
		if (splitCron.length !== CRON_EXPR_ORDER.length) {
			throw ERR_TEXT_WRONG_CRON;
		}

		for (let i = 0; i < splitCron.length; i++) {
			let output = [];
			switch (i) {
				case cronExprOrdinal.MINUTES:
					output = this._minutes;
					break;
				case cronExprOrdinal.HOURS:
					output = this._hours;
					break;
				case cronExprOrdinal.DAY_OF_MONTH:
					output = this._daysOfMonth;
					break;
				case cronExprOrdinal.MONTH:
					output = this._month;
					break;
				case cronExprOrdinal.DAY_OF_WEEK:
					output = this._daysOfWeek;
					break;
				default:
					break;
			}
			let hword=this._analyze(splitCron[i], output, CRON_EXPR_ORDER[i])
			this.human=(this.human=="")?hword: this.human+", "+hword;
		}
	}

	/**
		* 
		* @param {String} word 
		* @param {String} wordlist 
		* @returns 
		*/
	_indexOfWordlist(word, wordlist) {
		word = word.toUpperCase();
		let ind = -1
		let mod = -1;

		ind = wordlist.indexOf(word);
		if (ind == -1) return ind;

		mod = ind % 3;
		if (mod != 0) throw ERR_TEXT_WRONG_CRON;

		return ind / 3;
	}

	/**
		* 
		* @param {String} cron 
		* @param {number[]} output 
		* @param {string} what 
		*/
	_analyze(cron, output, what) {
		let step = 1;
		let start = -1;
		let end = output.length - 1;
		let tmp = -1;

		let isStep = false
		let isRange = false
		let globStar = false

		let wordlist =
			(what === CRON_EXPR_ORDER[cronExprOrdinal.MONTH]) ?
				WORDLIST_MONTH
				: (what === CRON_EXPR_ORDER[cronExprOrdinal.DAY_OF_WEEK]) ?
					WORDLIST_DAY_OF_WEEK
					: "";

		let wordb = ""
		let sb = "";

		/*
			* forme dei valori
			* 
			* x-y : range
			* x : numero singolo 
			* * : tutti i valori
			* 
			* Ogni valore può avere indicato uno step ( con /<numero> ) 
			* 
			* Alcuni valori possono essere alfanumerici (vedi wordlist) 
			*/
		for (let i = 0; i<cron.length; i++) {
			let c = cron.charAt(i); 
			if (/[A-Za-z]/.test(c)) {
				if (tmp != -1 || globStar)
					throw ERR_TEXT_WRONG_CRON;
				wordb += c;
			} else if (/\d/.test(c)) {
				if (wordb !== "" || (globStar && !isStep)) throw ERR_TEXT_WRONG_CRON;
				tmp = (tmp == -1) ? 0 : tmp;
				tmp = tmp * 10 + parseInt(c);
			} else if (c == "/") {
				if (wordb !== "") {
					let indW = this._indexOfWordlist(word, wordlist);
					if (isRange) end = indW;
					else start = indW;
					wordb = "";
				} else {
					if (tmp == -1) throw ERR_TEXT_WRONG_CRON;
					if (isRange) end = tmp;
					else start = tmp;
					tmp = -1;
				}
				isStep=true;
			} else if (c == '*') {
				if (wordb !== "" || tmp != -1)
					throw ERR_TEXT_WRONG_CRON;
				tmp = start = 0;
				end = output.length - 1;
				if (what === CRON_EXPR_ORDER[cronExprOrdinal.MONTH] || what === CRON_EXPR_ORDER[cronExprOrdinal.DAY_OF_WEEK]) {
					tmp++;
					start++;
					end++;
				}
				globStar = true;
			} else if (c == '-') {
				if(globStar || isStep ) throw ERR_TEXT_WRONG_CRON;				
				if( wordb !== "") {
					start=this._indexOfWordlist(wordb, wordlist);
					wordb="";
				} else {
					if (tmp==-1) throw ERR_TEXT_WRONG_CRON;
					start=tmp;
					tmp=-1;
				}
				isRange=true;
				end=-1;
			} 
			if (c==','||i==cron.length-1) {
				if( wordb !== "") {
					let indW=this._indexOfWordlist(wordb, wordlist);
					if(indW==-1) throw ERR_TEXT_WRONG_CRON;
					if (isRange) end=indW;
					else if (isStep) throw ERR_TEXT_WRONG_CRON;
					else start=indW;
				} else {
					if(tmp==-1) throw ERR_TEXT_WRONG_CRON;
					if (isStep) step=tmp;
					else if (isRange) end=tmp;
					else start=tmp;
				}
				if (isRange && end<start) throw ERR_TEXT_WRONG_CRON;
				
				// create human
				if(!globStar && !isRange && !isStep) sb+="at "+what+" "+start;
				else if(!globStar && !isRange) sb+="every "+what+" from "+start+" ";
				else if(!globStar) sb+="every "+what+" on ranges from "+start+" ";
				else if (globStar) sb+="every "+what+" ";
				
				if(isRange) sb+="to "+end+" ";
				
				if(isStep && step>1) sb+="with "+step+" steps at a time";

				// apply
				if(what === CRON_EXPR_ORDER[cronExprOrdinal.MONTH] || what=== CRON_EXPR_ORDER[cronExprOrdinal.DAY_OF_WEEK]) {
					start--;
					end--;
				}
				
				if (! globStar && ! isStep && ! isRange) {end=start;}
				for (let j=start; j<=end;j+=step) 
					if (output [j]) throw ERR_TEXT_WRONG_CRON;
					else output [j]=true;
				
				//reset 
				step=1; start=-1; end = output.length; tmp=-1;
				wordb="";
				isStep=false; isRange=false; globStar=false;
				if (i!=cron.length-1) sb+=" and "
			}
		}
		return sb.trim();
	}
}

let test="* * * * *"
let l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="1 * * * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* 1 * * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* * 1 * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="1/1 * * * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* * * * SUN"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* * * JUL *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* 0-12/2 * * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* * 1,3 * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* * */14 * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)



console.log("the end")