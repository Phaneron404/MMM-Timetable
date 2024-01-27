/*! *****************************************************************************
  mmm-timetable
  Version 1.0.0

  A Timetable to show subjects in school for the MagicMirror² platform.
  Please submit bugs at https://github.com/

  (c) danielfranke@live.de
  Licence: MIT

  This file is auto-generated. Do not edit.
***************************************************************************** */

!function(){"use strict";class e{static getCellType(e,t,i){let l="contentCell";return this.isEmptyTexts(e.texts)?l="emptyCell":t.forEach(((t,s)=>{t.cells.forEach(((t,a)=>{e.id===t.id&&(void 0!==i.titleRow&&i.titleRow.includes(s)||void 0!==i.titleColumn&&i.titleColumn.includes(a))&&(l="titleCell")}))})),l}static isEmptyTexts(e){let t=!0;return e.forEach((e=>{""!==e.trim()&&(t=!1)})),t}}Module.register("MMM-SchoolTimetable",{displayedTimeTable:[],lastIndex:-1,defaults:{srcCSV:"",timeTable:[],borderWidth:5,borderColor:"rgba(0, 0, 0, 0)",cellColor:"#1E1E20",titleCellColor:"#B7410E",emptyCellColor:"rgba(0, 0, 0, 0)",titleRow:[0],titleColumn:[0]},start(){this.setDisplayedTimeTable(),this.prepareTable(),this.scheduleUpdate()},setDisplayedTimeTable(){this.displayedTimeTable=[],void 0!==this.config.pagination?"column"==this.config.pagination.mode&&(this.config.timeTable.forEach((e=>{const t={cells:[]};let i=0;e.cells.forEach(((e,l)=>{let s=!1;this.config.pagination.keepFirst&&0==l&&(t.cells.push(e),s=!0,i++),i<this.config.pagination.maxValues&&l>this.lastIndex&&!s&&(t.cells.push(e),i++)})),this.displayedTimeTable.push(t)})),this.lastIndex=this.lastIndex+this.config.pagination.maxValues,this.lastIndex>=this.config.timeTable[0].cells.length-1&&(this.lastIndex=-1)):this.displayedTimeTable=this.config.timeTable},prepareTable(){let e=0;this.displayedTimeTable.forEach((t=>{t.cells.forEach((t=>{t.id=e++}))}))},getTemplate:()=>"templates/timetable.njk",getTemplateData(){return{config:this.config,timeTable:this.displayedTimeTable,utils:e}},scheduleUpdate(){void 0!==this.config.pagination&&setInterval((()=>{this.setDisplayedTimeTable(),this.prepareTable(),this.updateDom()}),1e3*this.config.pagination.duration)}})}();
