/* 
 * This file includes functions run after extension page is loaded
 */

$(document).ready(function(){
   Conetserv.onReady();
});

/*
 * Function, which is started after everything has been loaded
 */
$(window).load(function() {
   Conetserv.onLoad();
});

/**
 * initialize page ui right after page creation
 */
$(function() {
   Conetserv.Ui.initialize();
});

