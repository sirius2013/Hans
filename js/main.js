/*---Copyright by: Matthias Zubke, 75196 Remchingen, Germany--*/

var currLang = 0;
var questionList = [];
var navigationList = [];
var mealHistoryList = [];
var defaultDate = "15.04.2015";

//Variables for Re-enter of  meal history
var bReEnter = false;
var indexReEnter = -1;

//Cordova library ready function
document.addEventListener("deviceready", onDeviceReady, false);

onDeviceReady();//We need to call this function directly for web version.

loadQuestionJSONFile();//Load de_Questions_AB2.json file

loadNavigationJSONFile();//Load NavQuestions_AA9.json file

//Define Meal Type
var MEAL_TYPE = {
	None: 0,
	Fastlane : 1,
	BBreakfast : 2,
	Breakfast : 3,
	ABreakfast : 4,
	Lunch : 5,
	ALunch : 6,
	Dinner : 7,
	ADinner : 8
};

var MealTypes = ["None","Fastlane","BBreakfast","Breakfast","ABreakfast","Lunch","ALunch","Dinner","ADinner"];

var MealTypeClass = ["None","vFastlane","vBBreakfast","vBreakfast","vABreakfast","vLunch","vALunch","vDinner","vADinner"];

var WeekClass = ["vSu", "vMo", "vTu",  "vWe",  "vTh",  "vFr",  "vSa"];


//Define Mood status
var MOOD = {
	Bad : 0,
	Normal : 1,
	Good : 2
}

//Save latest Meal type on the local storage


//Name: onDeviceReady
//Comment: 
//1. Get last language from local storage after run app
//2. After get language, change language
function onDeviceReady(){
    var currLang1 = window.localStorage.getItem("currLang");
    if(currLang1 == null){
        currLang = 0;
    }else{
        currLang = window.localStorage.getItem("currLang");
    }

    changeLanguage();
}

//Name: Home page show (jquery mobile  function)
//Comment: 
//1. This function will call when show home page. 
//2. Localization with current language
$(document).on("pageshow", "#home", function(event) {
	changeLanguage();
});


//Name: Input page show (jquery mobile  function)
//Comment: 
//1. This function will call when show input page. 
//2. Localization with current language
$(document).on("pagebeforeshow", "#input", function(event) {

	$("#input .lastMeal").removeClass().addClass("lastMeal");
	var lastMealType = window.localStorage.getItem("lastmeal");
	
	var mealString = "";
	
	if(lastMealType == undefined || lastMealType == null) {
		
	}else{
		$("#input .lastMeal").addClass(MealTypeClass[lastMealType]);
	}
	
	date = window.localStorage.getItem("date");
	
	if((date != null) && (date != undefined) && (date != 'null')) {
		$("#input .date").html(date);
	}else{
		$("#input .date").html(defaultDate);
	}
	
	changeLanguage();
});

//Show date picker control to change date.
function showDatePicker() {
	if(currLang == 0)
		$("#datepicker").datepicker($.datepicker.regional["es"]);
	else
		$("#datepicker").datepicker($.datepicker.regional["de"]);
	
	$("#datePicker").datepicker("show");
}

$(document).on("change", "#input #datePicker", function(event) {
	console.log($(this).val());
	var currentDate = window.localStorage.getItem("date");
	
	date = $(this).val();
	/*dd = date.substr(3, 2);
	mm = date.substr(0, 2);
	yy = date.substr(6, 4);
	*/
	yy=date.substr(0,4);
	mm=date.substr(5,2);
	dd=date.substr(8,2);
	date = dd + "." + mm + "." + yy;
	
	selDate =  new Date($(this).val());
	$("#input .day").removeClass().addClass("day").addClass(WeekClass[selDate.getDay()]);
	$("#input .date").html(date);
	
	$("#mealtype .day").removeClass().addClass("day").addClass(WeekClass[selDate.getDay()]);
	$("#mealtype .date").html(date);
	
	$("#question .day").removeClass().addClass("day").addClass(WeekClass[selDate.getDay()]);
	$("#question .date").html(date);

	window.localStorage.setItem("date", date);
	
	if(currentDate != date) {
		//Clear all UI data
		$("#input input[type='checkbox']").prop( "checked", false ).checkboxradio( "refresh" );
		//$("#mealtype input[type='radio']").prop( "checked", false ).checkboxradio( "refresh" );
		//$("#question input[type='radio']").prop( "checked", false ).checkboxradio( "refresh" );
		
		window.localStorage.setItem("currentMeal", "");
		window.localStorage.setItem("lastmeal", "");
		
		$("#input .lastMeal").removeClass().addClass("lastMeal");
		var className = $("#input .lastMeal").attr("class");
		console.log(className);
		$("#mealtype .lastMeal").removeClass().addClass(className);		
		
		mealHistoryList = [];
	}
	
	changeLanguage();
});


//Name: Options page show (jquery mobile  function)
//Comment: 
//1. This function will call when show options page. 
//2. Localization with current language
//3. Change language of app when change language control.
$(document).on("pageshow", "#options", function(event) {
	$("#multilang").val(currLang);
    $("#multilang").selectmenu('refresh');
	changeLanguage();
	$("#multilang").change(function(){
	       currLang = $(this).val();
	       window.localStorage.setItem("currLang", currLang);
	       changeLanguage();
	});
});


//MealType Page Show Events
$(document).on("pagebeforeshow", "#mealtype", function(event) {
	
	//show seleted date
	date = window.localStorage.getItem("date");
	if((date != null) && (date != undefined) && (date != 'null')) {
		$("#mealtype .date").html(date);
	}else{
		$("#mealtype .date").html(defaultDate);
	}

	//Reset re-enter variables
	indexReEnter = -1;
	bReEnter  = false;	
	
	//Decide the available meal type
	var lastMealType = window.localStorage.getItem("lastmeal");
	var mealString = "";
	
	$("#mealtype .lastMeal").removeClass().addClass("lastMeal");		
	
	if(lastMealType == undefined || lastMealType == null || lastMealType == "") {
		lastMealType = MEAL_TYPE.None;
	}else{
		$("#mealtype .lastMeal").addClass(MealTypeClass[lastMealType]);
	}
	
	if(lastMealType == MEAL_TYPE.None && lastMealType != MEAL_TYPE.Fastlane) {
		mealString += '<li class="fastlane" style="padding: 20px;">';
		mealString += '	<div class="ui-btn-left">';
		mealString += '		<h2 class="vFastlane">Fastlane</h2>';
		mealString += '	</div>';
		mealString += '	<div class="ui-btn-right" style="right: 105px;top:10px">';
		mealString += '		<div data-role="controlgroup" data-type="horizontal">';
		mealString += '			<input name="meal" type="radio" style="margin-left:70px;"/>';
		mealString += '		</div>';
		mealString += '	</div>';
		mealString += '</li>';
	}
	
	if((lastMealType == MEAL_TYPE.None && lastMealType != MEAL_TYPE.Fastlane) || lastMealType == MEAL_TYPE.BBreakfast) {
		mealString += '<li class="bbreakfast" style="padding: 20px;">';
		mealString += '	<div class="ui-btn-left">';
		mealString += '		<h2 class="vBBreakfast">Before breakfast</h2>';
		mealString += '	</div>';
		mealString += '	<div class="ui-btn-right" style="right: 105px;top:10px">';
		mealString += '		<div data-role="controlgroup" data-type="horizontal">';
		mealString += '			<input name="meal" type="radio" style="margin-left:70px;"/>';
		mealString += '		</div>';
		mealString += '	</div>';
		mealString += '</li>';
	}
	
	if(lastMealType < MEAL_TYPE.Breakfast && lastMealType != MEAL_TYPE.Fastlane) {
		mealString += '<li class="breakfast" style="padding: 20px;">';
		mealString += '	<div class="ui-btn-left">';
		mealString += '		<h2 class="vBreakfast">Breakfast</h2>';
		mealString += '	</div>';
		mealString += '	<div class="ui-btn-right" style="right: 105px;top:10px">';
		mealString += '		<div data-role="controlgroup" data-type="horizontal">';
		mealString += '			<input name="meal" type="radio" style="margin-left:70px;"/>';
		mealString += '		</div>';
		mealString += '	</div>';
		mealString += '</li>';
	}
	
	if(lastMealType <= MEAL_TYPE.ABreakfast && lastMealType != MEAL_TYPE.Fastlane) {
		mealString += '<li class="abreakfast" style="padding: 20px;">';
		mealString += '	<div class="ui-btn-left">';
		mealString += '		<h2 class="vABreakfast">After breakfast</h2>';
		mealString += '	</div>';
		mealString += '	<div class="ui-btn-right" style="right: 105px;top:10px">';
		mealString += '		<div data-role="controlgroup" data-type="horizontal">';
		mealString += '			<input name="meal" type="radio" style="margin-left:70px;"/>';
		mealString += '		</div>';
		mealString += '	</div>';
		mealString += '</li>';
	}
	
	if(lastMealType < MEAL_TYPE.Lunch && lastMealType != MEAL_TYPE.Fastlane) {
		mealString += '<li class="lunch" style="padding: 20px;">';
		mealString += '	<div class="ui-btn-left">';
		mealString += '		<h2 class="vLunch">Lunch</h2>';
		mealString += '	</div>';
		mealString += '	<div class="ui-btn-right" style="right: 105px;top:10px">';
		mealString += '		<div data-role="controlgroup" data-type="horizontal">';
		mealString += '			<input name="meal" type="radio" style="margin-left:70px;"/>';
		mealString += '		</div>';
		mealString += '	</div>';
		mealString += '</li>';
	}
	
	if(lastMealType <= MEAL_TYPE.ALunch && lastMealType != MEAL_TYPE.Fastlane) {
		mealString += '<li class="alunch" style="padding: 20px;">';
		mealString += '	<div class="ui-btn-left">';
		mealString += '		<h2 class="vALunch">After lunch</h2>';
		mealString += '	</div>';
		mealString += '	<div class="ui-btn-right" style="right: 105px;top:10px">';
		mealString += '		<div data-role="controlgroup" data-type="horizontal">';
		mealString += '			<input name="meal" type="radio" style="margin-left:70px;"/>';
		mealString += '		</div>';
		mealString += '	</div>';
		mealString += '</li>';
	}
	
	if(lastMealType < MEAL_TYPE.Dinner && lastMealType != MEAL_TYPE.Fastlane) {
		mealString += '<li class="dinner" style="padding: 20px;">';
		mealString += '	<div class="ui-btn-left">';
		mealString += '		<h2 class="vDinner">Dinner</h2>';
		mealString += '	</div>';
		mealString += '	<div class="ui-btn-right" style="right: 105px;top:10px">';
		mealString += '		<div data-role="controlgroup" data-type="horizontal">';
		mealString += '			<input name="meal" type="radio" style="margin-left:70px;"/>';
		mealString += '		</div>';
		mealString += '	</div>';
		mealString += '</li>';
	}	
	
	if(lastMealType <= MEAL_TYPE.ADinner && lastMealType != MEAL_TYPE.Fastlane) {
		mealString += '<li class="adinner" style="padding: 20px;">';
		mealString += '	<div class="ui-btn-left">';
		mealString += '		<h2 class="vADinner">After dinner</h2>';
		mealString += '	</div>';
		mealString += '	<div class="ui-btn-right" style="right: 105px;top:10px">';
		mealString += '		<div data-role="controlgroup" data-type="horizontal">';
		mealString += '			<input name="meal" type="radio" style="margin-left:70px;"/>';
		mealString += '		</div>';
		mealString += '	</div>';
		mealString += '</li>';
	}
	
	$("#mealtypeList").html(mealString);
	
	$("#mealtypeList input[type='radio']").checkboxradio();
	$("#mealtypeList input[type='radio']").checkboxradio("refresh");
	//$( "#mealtypeList #fastlaneRdo" ).prop( "checked", true ).checkboxradio( "refresh" );
	$( "#mealtypeList" ).listview( "refresh" );
	
	
	var historyString = "";
	//Load meal history
	for(var i = 0; i < mealHistoryList.length; i++){
		var mealHistory = mealHistoryList[i];
		
		className = MealTypeClass[mealHistory.mealtype];
		mealtype = MealTypes[mealHistory.mealtype];
		
		var imgSrc = "better.png";
		if(mealHistory.statusNum[0] <= 2.9){
			imgSrc = "bad.png"
		}else if (mealHistory.statusNum[0] <= 3.9){
			imgSrc = "good.png"
		}else{
			imgSrc = "better.png"
		}
		
		historyString += '<li class="history">';
		historyString += '	<a href="#" style="">';
		historyString += '		<h2  class="' + className  + '">' + mealtype + '</h2>';
		historyString += '		<img src="res/' + imgSrc + '" alt="good" />';
		historyString += '	</a>';
		historyString += '</li>';
	}
	
	$("#mealhistoryList").html(historyString);
	$("#mealhistoryList" ).listview( "refresh" );
	
	changeLanguage();
});

$(document).on("click", "#mealtype #mealtypeList li", function(event) {
	var className = $(this).attr("class");
	bReEnter  = false;
	
	if($(this).hasClass("fastlane")) {
		window.localStorage.setItem("currentMeal", MEAL_TYPE.Fastlane);
	}
	if($(this).hasClass("bbreakfast")) {
		window.localStorage.setItem("currentMeal", MEAL_TYPE.BBreakfast);
	}
	if($(this).hasClass("breakfast")) {
		window.localStorage.setItem("currentMeal", MEAL_TYPE.Breakfast);
	}
	if($(this).hasClass("abreakfast")) {
		window.localStorage.setItem("currentMeal", MEAL_TYPE.ABreakfast);
	}
	if($(this).hasClass("lunch")) {
		window.localStorage.setItem("currentMeal", MEAL_TYPE.Lunch);
	}
	if($(this).hasClass("alunch")) {
		window.localStorage.setItem("currentMeal", MEAL_TYPE.ALunch);
	}
	if($(this).hasClass("dinner")) {
		window.localStorage.setItem("currentMeal", MEAL_TYPE.Dinner);
	}
	if($(this).hasClass("adinner")) {
		window.localStorage.setItem("currentMeal", MEAL_TYPE.ADinner);
	}
	
	$.mobile.changePage("#question");
});



//Re-Enter the status of Meal-history
$(document).on("click", "#mealtype #mealhistoryList li", function(event) {
	idx = $(this).index();
	indexReEnter = idx;
	bReEnter  = true;
	$.mobile.changePage("#question");
});

var reEnterNum = 0;
/***********
	Load Question Page
	Test Phase: Show Questions about Hunger
************/
$(document).on("pagebeforeshow", "#question", function(event) {
	curQuestionNum = 1;
	currentMeal = window.localStorage.getItem("currentMeal");
	
	$("#question .currentmeal").removeClass().addClass("currentmeal");
	$("#question .currentmeal").addClass(MealTypeClass[currentMeal]);

	if(bReEnter == true) {
		reEnterNum = 0;
		$("#question .currentmeal").removeClass().addClass("currentmeal");
		$("#question .currentmeal").addClass(MealTypeClass[mealHistoryList[indexReEnter].mealtype]);
		
		$("#questionList").find("li").eq(mealHistoryList[indexReEnter].statusNum[0] - 1).find("input[type='radio']").prop( "checked", true );
	}else{
		$("#questionList").find("li").find("input[type='radio']").prop( "checked", false );
	}
	
	for(var i=0;i<questionList.length;i++) {
		var question = questionList[i]; 
		if(question._id == "KHunger") {
			$("#question #title").html(question.Titel);
			$("#question .A1 h2").html(question.A1);
			$("#question .A2 h2").html(question.A2);
			$("#question .A3 h2").html(question.A3);
			$("#question .A4 h2").html(question.A4);
			$("#question .A5 h2").html(question.A5);
			$("#question .A6 h2").html(question.A6);
			$("#question .A7 h2").html(question.A7);
			$("#question .A8 h2").html(question.A8);
			$("#question .A9 h2").html(question.A9);
			$("#question .A10 h2").html(question.A10);
			
			if(question.A1.length < 1){
				$("#question .A1").hide();
			}else{
				$("#question .A1").show();
			}
			
			if(question.A2.length < 1){
				$("#question .A2").hide();
			}else{
				$("#question .A2").show();
			}
			
			if(question.A3.length < 1){
				$("#question .A3").hide();
			}else{
				$("#question .A3").show();
			}
			
			if(question.A4.length < 1){
				$("#question .A4").hide();
			}else{
				$("#question .A4").show();
			}
			
			if(question.A5.length < 1){
				$("#question .A5").hide();
			}else{
				$("#question .A5").show();
			}
			
			if(question.A6.length < 1){
				$("#question .A6").hide();
			}else{
				$("#question .A6").show();
			}
			
			if(question.A7.length < 1){
				$("#question .A7").hide();
			}else{
				$("#question .A7").show();
			}
			
			if(question.A8.length < 1){
				$("#question .A8").hide();
			}else{
				$("#question .A8").show();
			}
			
			if(question.A9.length < 1){
				$("#question .A9").hide();
			}else{
				$("#question .A9").show();
			}
			
			if(question.A10.length < 1){
				$("#question .A10").hide();
			}else{
				$("#question .A10").show();
			}
		}
	}	
	
	$("#mealtypeList input[type='radio']").checkboxradio();
	$("#mealtypeList input[type='radio']").checkboxradio("refresh");	
	
	changeLanguage();
});

var curQuestionNum = 0;
var statusNumList = [];

//Question Page Click Event
//We will get the number of question.
$(document).on("click", "#question #questionList li", function(event) {	
	//$("#question input[type='radio']").prop( "checked", false ).checkboxradio( "refresh" );
	var statusNum = $(this).index() + 1;
	currentMeal = window.localStorage.getItem("currentMeal");
	var bFlag = false;	
	
	//If we choose all questions, then we need to move Input page.
	if(curQuestionNum >= questionList.length) {
		$.mobile.changePage("#input");
		//curQuestionNum = 0;
		return false;			
	}
	
	if(curQuestionNum == 1) {
		statusNumList = [];
		//For now, we need to decide status with KHunger
		if(bReEnter == true) {
			//mealHistoryList[indexReEnter].statusNum = statusNum;
		}else{
			
			mealHistoryList.push({
				mealtype : currentMeal,
				statusNum : statusNumList		
			});
			window.localStorage.setItem("lastmeal", currentMeal);
		}
	}
	if(bReEnter == false && curQuestionNum > 0) {
		statusNumList.push(statusNum);
		mealHistoryList[mealHistoryList.length-1].statusNum = statusNumList;
	}	
	
	
	
	bFlag = false;
	for(i = 0; i< navigationList.length; i++) {
			
		if(navigationList[i]._FrageArt == "Radio5" && questionList[curQuestionNum]._id == navigationList[i]._Label)  {
			bFlag = true;
			break;
		}
	}

	if(bFlag === false) {
	
		do {
			
			if(curQuestionNum >= questionList.length) {
				$.mobile.changePage("#input");
				curQuestionNum = 0;
				return false;			
				break;
			}
			console.log(curQuestionNum);
			for(i = 0; i< navigationList.length; i++) {
				if(navigationList[i]._FrageArt == "Radio5" && questionList[curQuestionNum]._id == navigationList[i]._Label)  {
					bFlag = true;
					break;
				}
			}
			
			if(bFlag == true)
				break;
			
			curQuestionNum++;
		}while(1);
		
	}

	
	if(bFlag == true) {
		
		//when select of the status, we need to show other questions.
		var question = questionList[curQuestionNum]; 
		
		$("#question #title").html(question.Titel);
		$("#question .A1 h2").html(question.A1);
		$("#question .A2 h2").html(question.A2);
		$("#question .A3 h2").html(question.A3);
		$("#question .A4 h2").html(question.A4);
		$("#question .A5 h2").html(question.A5);
		$("#question .A6 h2").html(question.A6);
		$("#question .A7 h2").html(question.A7);
		$("#question .A8 h2").html(question.A8);
		$("#question .A9 h2").html(question.A9);
		$("#question .A10 h2").html(question.A10);
		
		if(question.A1.length < 1){
			$("#question .A1").hide();
		}else{
			$("#question .A1").show();
		}
		
		if(question.A2.length < 1){
			$("#question .A2").hide();
		}else{
			$("#question .A2").show();
		}
		
		if(question.A3.length < 1){
			$("#question .A3").hide();
		}else{
			$("#question .A3").show();
		}
		
		if(question.A4.length < 1){
			$("#question .A4").hide();
		}else{
			$("#question .A4").show();
		}
		
		if(question.A5.length < 1){
			$("#question .A5").hide();
		}else{
			$("#question .A5").show();
		}
		
		if(question.A6.length < 1){
			$("#question .A6").hide();
		}else{
			$("#question .A6").show();
		}
		
		if(question.A7.length < 1){
			$("#question .A7").hide();
		}else{
			$("#question .A7").show();
		}
		
		if(question.A8.length < 1){
			$("#question .A8").hide();
		}else{
			$("#question .A8").show();
		}
		
		if(question.A9.length < 1){
			$("#question .A9").hide();
		}else{
			$("#question .A9").show();
		}
		
		if(question.A10.length < 1){
			$("#question .A10").hide();
		}else{
			$("#question .A10").show();
		}		
	}
	
	if(bReEnter == true) {
		$("#questionList").find("li").eq(mealHistoryList[indexReEnter].statusNum[reEnterNum + 1] - 1).find("input[type='radio']").prop( "checked", true ).checkboxradio("refresh");
		
		mealHistoryList[indexReEnter].statusNum[reEnterNum] = statusNum;
	}else{
		$("#question input[type='radio']").prop( "checked", false ).checkboxradio( "refresh" );
	}
	
	reEnterNum ++;

	curQuestionNum++;

});


//Name: changeLanguage
//Comment: 
//1. Localization with current language
//2. Add class all elements need to be translated.
function changeLanguage(){
	$("#datepicker").datepicker($.datepicker.regional["de"]);
	
	$('.vHome').html(langLabel[currLang].vHome);
	$('.vInput').html(langLabel[currLang].vInput);
	$('.vHelp').html(langLabel[currLang].vHelp);
	$('.vEvaluation').html(langLabel[currLang].vEvaluation);
	$('.vBack').html(langLabel[currLang].vBack);
	$('.vTraining').html(langLabel[currLang].vTraining);
	$('.vOptions').html(langLabel[currLang].vOptions);
	$('.vGoalDay').html(langLabel[currLang].vGoalDay);
	$('.vGoalWeek').html(langLabel[currLang].vGoalWeek);
	$('.vEmergency').html(langLabel[currLang].vEmergency);
	$('.vAmount').html(langLabel[currLang].vAmount);
	$('.vInsulinMeasure').html(langLabel[currLang].vInsulinMeasure);
	$('.vNeverDrinkAlc').html(langLabel[currLang].vNeverDrinkAlc);
	$('.vLanguage').html(langLabel[currLang].vLanguage);
	$('.vDeutsch').html(langLabel[currLang].vDeutsch);
	$('.vEnglish').html(langLabel[currLang].vEnglish);
	$('.vLastMeal').html(langLabel[currLang].vLastMeal);
	$('.vMeal').html(langLabel[currLang].vMeal);
	$('.vDrink').html(langLabel[currLang].vDrink);
	$('.vDrinking').html(langLabel[currLang].vDrinking);
	$('.vFruit').html(langLabel[currLang].vFruit);
	$('.vVegetable').html(langLabel[currLang].vVegetable);
	$('.vExercize').html(langLabel[currLang].vExercize);
	$('.vMedicine').html(langLabel[currLang].vMedicine);
	$('.vBloodPressure').html(langLabel[currLang].vBloodPressure);
	$('.vBloodSugar').html(langLabel[currLang].vBloodSugar);
	$('.vInsulin').html(langLabel[currLang].vInsulin);
	$('.vDailynote').html(langLabel[currLang].vDailynote);
	$('.vWeight').html(langLabel[currLang].vWeight);
	$('.vCompleteDay').html(langLabel[currLang].vCompleteDay);
	$('.vSelectMealType').html(langLabel[currLang].vSelectMealType);
	$('.vFastlane').html(langLabel[currLang].vFastlane);
	$('.vBBreakfast').html(langLabel[currLang].vBBreakfast);
	$('.vBreakfast').html(langLabel[currLang].vBreakfast);
	$('.vABreakfast').html(langLabel[currLang].vABreakfast);
	$('.vLunch').html(langLabel[currLang].vLunch);
	$('.vALunch').html(langLabel[currLang].vALunch);
	$('.vDinner').html(langLabel[currLang].vDinner);
	$('.vADinner').html(langLabel[currLang].vADinner);
	$('.vMealHistory').html(langLabel[currLang].vMealHistory);
	$('.vWeightRecord').html(langLabel[currLang].vWeightRecord);
	$('.vInputWeight').html(langLabel[currLang].vInputWeight);
	$('.vRoundedTo').html(langLabel[currLang].vRoundedTo);
	$('.vLastWeight').html(langLabel[currLang].vLastWeight);
	$('.vNewWeight').html(langLabel[currLang].vNewWeight);
	$('.vTable').html(langLabel[currLang].vTable);
	$('.vChart').html(langLabel[currLang].vChart);
	$('.vWeek').html(langLabel[currLang].vWeek);
	$('.vMoreAThis').html(langLabel[currLang].vMoreAThis);
	$('.vMore').html(langLabel[currLang].vMore);
	$('.vMo').html(langLabel[currLang].vMo);
	$('.vTu').html(langLabel[currLang].vTu);
	$('.vWe').html(langLabel[currLang].vWe);
	$('.vTh').html(langLabel[currLang].vTh);
	$('.vFr').html(langLabel[currLang].vFr);
	$('.vSa').html(langLabel[currLang].vSa);
	$('.vSu').html(langLabel[currLang].vSu);
	$('.vResult').html(langLabel[currLang].vResult);
	$('.vOwnResult').html(langLabel[currLang].vOwnResult);
	$('.vNumberProblems').html(langLabel[currLang].vNumberProblems);
	$('.vNumberBinge').html(langLabel[currLang].vNumberBinge);
	$('.vNumberUrges').html(langLabel[currLang].vNumberUrges);
	$('.vPhysHung').html(langLabel[currLang].vPhysHung);
	$('.vEnjoyFood').html(langLabel[currLang].vEnjoyFood);
	$('.vStopFull').html(langLabel[currLang].vStopFull);
	$('.vTextGoalWeek').html(langLabel[currLang].vTextGoalWeek);	
	$('.vHealthyFood').html(langLabel[currLang].vHealthyFood);
	$('.vMonday').html(langLabel[currLang].vMonday);
	$('.vTuesday').html(langLabel[currLang].vTuesday);
	$('.vWednesday').html(langLabel[currLang].vWednesday);
	$('.vThursday').html(langLabel[currLang].vThursday);
	$('.vFriday').html(langLabel[currLang].vFriday);
	$('.vSaturday').html(langLabel[currLang].vSaturday);
	$('.vSunday').html(langLabel[currLang].vSunday);
	$('.vNumber').html(langLabel[currLang].vNumber);
}


/*****************
Load JSON File
json file path: data/de_Questions_AB2.json
******************/
function loadQuestionJSONFile() {
	$.getJSON("data/de_Questions_AB2.json", function( data ) {
		questionList = data.Standardfragen_de.Frage;
		//alert(questionList.length);
	});
}

/*****************
Load Navigation JSON File
json file path: data/NavQuestions_AA9.json
******************/
function loadNavigationJSONFile() {
	$.getJSON("data/NavQuestions_AA9.json", function( data ) {
		navigationList =  [];
		for(i = 0;i<data.Navigation.Meal.frage.length ;i++) {
			obj = data.Navigation.Meal.frage[i];
			navigationList.push(obj);
		}
		
		for(i = 0;i<data.Navigation.Day.frage.length ;i++) {
			obj = data.Navigation.Day.frage[i];
			navigationList.push(obj);
		}		
		
		for(i = 0;i<data.Navigation.CloseDay.frage.length ;i++) {
			obj = data.Navigation.CloseDay.frage[i];
			navigationList.push(obj);	
		}
		
		console.log(navigationList.length);
		
		//alert(questionList.length);
	});
}
