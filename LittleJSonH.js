const cronExprOrdinal = {
	MINUTES: 0,
	HOURS: 1,
	DAY_OF_MONTH: 2,
	MONTH: 3,
	DAY_OF_WEEK: 4,
	YEAR:5
}

const ERR_TEXT_WRONG_CRON = "ERROR= can't parse this string"

const CRON_EXPR_ORDER = ["minute", "hour", "day of month", "month", "day of week"]

const WORDLIST_MONTH = "\0\0\0JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC"; // \0\0\0 is added to match range 1-12
const WORDLIST_DAY_OF_WEEK = "SUNMONTUEWEDTHUFRISAT";

const MAX_YEAR_TRY = 4;

/**
	* 
	* @param {number} month 
	* @param {number} year 
	* @returns 
	*/
function monthLength(month, year) {
		
	switch (month) {
		case 0:case 2:case 4:case 6:case 7:case 9:case 11: return 31;
		case 3:case 5:case 8:case 10: return 30;
	}
	
	return  year%4==0 && (year%400==0 || year%100!=0 )  ? 29 : 28;
}


class LittleJSonH {
	_cronexpr = "";
	/** @type{boolean[]} */
	_minutes = new Array(60).map(v=>false); // 60
	/** @type{boolean[]} */
	_hours = new Array(24).map(v=>false); // 24
	/** @type{boolean[]} */
	_daysOfMonth = new Array(31).map(v=>false); // 31
	/** @type{boolean[]} */
	_months = new Array(12).map(v=>false); // 12
	/** @type{boolean[]} */
	_daysOfWeek = new Array(7).map(v=>false); // 7

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
					output = this._months;
					break;
				case cronExprOrdinal.DAY_OF_WEEK:
					output = this._daysOfWeek;
					break;
				default:
					break;
			}
			let hword=this._analyze(splitCron[i], output, CRON_EXPR_ORDER[i])
			this.human=(this.human=="")?hword: this.human+", "+hword;
			this.currentTime=new Date();
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
		* @param {boolean[]} values 
		* @param {number} index 
		* @returns 
		*/
	_searchNextOccurence(values, index) {
		if(index>values.length) index=0; // restart
		for (let tmp=index+1;tmp<values.length;tmp++) {
			if(values[tmp]) return tmp;
		}
		for (let tmp=0;tmp<index;tmp++) {
			if(values[tmp]) return tmp;
		}
		return index;
	}
	
	/**
		* 
		* @param {int[]} time 
		* @returns 
		*/
	_nextMinute(time) {
		let tmp=0;
		tmp=this._searchNextOccurence(this._minutes, time[cronExprOrdinal.MINUTES]); //update minute
		time[cronExprOrdinal.HOURS]=tmp<=time[cronExprOrdinal.MINUTES]?time[cronExprOrdinal.HOURS]+1:time[cronExprOrdinal.HOURS]; // update hour
		time[cronExprOrdinal.MINUTES]=tmp; // update minute
		
		return time;
	}

	_nextHour(time) {
		let tmp=0;
		tmp=this._searchNextOccurence(this._hours, time[cronExprOrdinal.HOURS]); //update Hour
		time[cronExprOrdinal.DAY_OF_MONTH]=tmp<=time[cronExprOrdinal.HOURS]?time[cronExprOrdinal.DAY_OF_MONTH]+1:time[cronExprOrdinal.DAY_OF_MONTH]; // update dM
		time[cronExprOrdinal.HOURS]=tmp; // update Hour
		time[cronExprOrdinal.MINUTES]=0;
		
		return time;
	}
	
	_nextDayOfMonth(time) {
		let tmp=0;
		
		tmp=this._searchNextOccurence(this._daysOfMonth, time[cronExprOrdinal.DAY_OF_MONTH]); //update dM
		time[cronExprOrdinal.MONTH]=tmp<=time[cronExprOrdinal.DAY_OF_MONTH]?time[cronExprOrdinal.MONTH]+1:time[cronExprOrdinal.MONTH]; // update month
		time[cronExprOrdinal.DAY_OF_MONTH]=tmp; // update dM
		time[cronExprOrdinal.HOURS]=time[cronExprOrdinal.MINUTES]=0;
		
		return time;
	}
	
	_nextMonth(time) {
		let tmp=0;
		
		tmp=this._searchNextOccurence(this._months, time[cronExprOrdinal.MONTH]);
		time[cronExprOrdinal.YEAR]=tmp<=time[cronExprOrdinal.MONTH]?time[cronExprOrdinal.YEAR]+1:time[cronExprOrdinal.YEAR];
		time[cronExprOrdinal.MONTH]=tmp;
		time[cronExprOrdinal.DAY_OF_MONTH]=time[cronExprOrdinal.HOURS]=time[cronExprOrdinal.MINUTES]=0;
		
		return time;
	}

	nextT() {
		let minute=this.currentTime.getMinutes()
		let hours=this.currentTime.getHours()
		let dayOfMonth=this.currentTime.getDate()
		let month=this.currentTime.getMonth()
		let dayOfWeek=this.currentTime.getDay()
		let year=this.currentTime.getFullYear()
		
		let time = [minute,hours,dayOfMonth,month,dayOfWeek,year]
		//console.log(time[0],'|',time[1],'|',time[2],'|',time[3] + 1,'|',time[4],'|',time[5])
		
		
		this._nextMinute(time)
		
		let repeatitions = MAX_YEAR_TRY; 

		while (repeatitions > -1 ){
			if( time[cronExprOrdinal.MONTH]>=this._months.length || ! this._months[time[cronExprOrdinal.MONTH]]) {
				year=time[cronExprOrdinal.YEAR];
				this._nextMonth(time);
				if ( year!==time[cronExprOrdinal.YEAR]) repeatitions--;
			} else if (time[cronExprOrdinal.DAY_OF_MONTH]>=monthLength(time[cronExprOrdinal.MONTH], time[cronExprOrdinal.YEAR]) || ! this._daysOfMonth[time[cronExprOrdinal.DAY_OF_MONTH]]) { 
				this._nextDayOfMonth(time);
			} else if (time[cronExprOrdinal.HOURS]>=this._hours.length || ! this._hours[time[cronExprOrdinal.HOURS]]) {
				this._nextHour(time);
			} else if (time[cronExprOrdinal.MINUTES]>=this._minutes.length || ! this._minutes[time[cronExprOrdinal.MINUTES]]) {
				this._nextMinute(time);
			} else {
				this.currentTime=new Date(time[cronExprOrdinal.YEAR],time[cronExprOrdinal.MONTH], time[cronExprOrdinal.DAY_OF_MONTH], time[cronExprOrdinal.HOURS], time[cronExprOrdinal.MINUTES]);
				time[cronExprOrdinal.DAY_OF_WEEK]=this.currentTime.getDay();
				if( this._daysOfWeek[time[cronExprOrdinal.DAY_OF_WEEK]] ) break;
				this._nextDayOfMonth(time);
			}
		}
		//console.log(time[0],'|',time[1],'|',time[2],'|',time[3] + 1,'|',time[4],'|',time[5])
		
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

export {LittleJSonH};