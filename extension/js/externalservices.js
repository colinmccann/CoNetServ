/* Check CoNetServ object */
if(!Conetserv) var Conetserv = {};

/* LocalServices object */
Conetserv.ExternalServices = {
   enabled: true,
   isRunning : 0,

   Ping : {
      next: 1,
      max: 0,  // number of active services, increased by LookingGlass object when starting them

      console: false
   },

   Ping6 : {
      next: 1,
      max: 0,  // number of active services

      console: false
   },

   Tracert : {
      next: 1,
      max: 0,  // number of active services

      console: false
   },

   Tracert6 : {
      next: 1,
      max: 0,  // number of active services

      console: false
   },

   initialize : function () {
      if(!this.enabled)
         return;

      this.Ping.console = [];
      this.Ping.console[1] = new Conetserv.Console("external-ping-console-1");
      this.Ping.console[2] = new Conetserv.Console("external-ping-console-2");
      this.Ping.console[3] = new Conetserv.Console("external-ping-console-3");

      this.Ping6.console = [];
      this.Ping6.console[1] = new Conetserv.Console("external-ping6-console-1");
      this.Ping6.console[2] = new Conetserv.Console("external-ping6-console-2");
      this.Ping6.console[3] = new Conetserv.Console("external-ping6-console-3");

      this.Tracert.console = [];
      this.Tracert.console[1] = new Conetserv.Console("external-tracert-console-1");
      this.Tracert.console[2] = new Conetserv.Console("external-tracert-console-2");

      this.Tracert6.console = [];
      this.Tracert6.console[1] = new Conetserv.Console("external-tracert6-console-1");
      this.Tracert6.console[2] = new Conetserv.Console("external-tracert6-console-2");
   },

   start : function ()  {
      /*
       * Check if start is possible
       */
      if(!this.enabled || this.isRunning) {
         return false;
      }

      /*
       * Set URL value or show red bar around url field
       */
      if(!Conetserv.Url.set(document.getElementById("external-url").value)) {
         document.getElementById("external-url").style.color="red";
         document.getElementById("external-url").focus();
         return false;
      }

      this.isRunning = 1;

      /* Change button icon */
      Conetserv.Ui.startToStop("#external-url-start");

      /* disable input */
      Conetserv.Ui.disableInput("#external-url");

      /* Reset service values */
      this.Ping.next = this.Ping6.next = this.Tracert.next = this.Tracert6.next = 1;
      this.Ping.max = this.Ping6.max = this.Tracert.max = this.Tracert6.max = 0;

      /* Clean consoles */
      for(var i=1; i<=3; i++) {
         this.Ping.console[i].clear();
         this.Ping6.console[i].clear();
         $("#external-ping-service-" + i).html("");
         $("#external-ping6-service-" + i).html("");
      }
      for(i=1; i<=2; i++) {
         this.Tracert.console[i].clear();
         this.Tracert6.console[i].clear();
         $("#external-tracert-service-" + i).html("");
         $("#external-tracert6-service-" + i).html("");
      }


      /* Start external info services */
      Conetserv.LookingGlass.start(
         /* started */
         function() {
            /* check, if any of services has been allowed in options
             * if none, output error into console
             */
            if(Conetserv.ExternalServices.Ping.max) {
               Conetserv.Ui.addIcons(".external", ".ping", '', '', 'ui-icon-clock');
            }
            else {
              Conetserv.ExternalServices.Ping.console[1].setErr("<strong>You have deactivated all Ping IPv4 external services in options.</strong> <br/><br/>\
                  To allow them again, please go to Settings -> External services page.") ;
            }
            if(Conetserv.ExternalServices.Ping6.max) {
               Conetserv.Ui.addIcons(".external", ".ping6", '', '', 'ui-icon-clock');
            }
            else {
              Conetserv.ExternalServices.Ping6.console[1].setErr("<strong>You have deactivated all Ping IPv6 external services in options.</strong> <br/><br/>\
                  To allow them again, please go to Settings -> External services page.") ;
            }
            if(Conetserv.ExternalServices.Tracert.max) {
               Conetserv.Ui.addIcons(".external", ".tracert", '', '', 'ui-icon-clock');
            }
            else {
              Conetserv.ExternalServices.Tracert.console[1].setErr("<strong>You have deactivated all Traceroute IPv4 external services in options.</strong> <br/><br/>\
                  To allow them again, please go to Settings -> External services page.") ;
            }
            if(Conetserv.ExternalServices.Tracert6.max) {
               Conetserv.Ui.addIcons(".external", ".tracert6", '', '', 'ui-icon-clock');
            }
            else {
              Conetserv.ExternalServices.Tracert6.console[1].setErr("<strong>You have deactivated all Traceroute IPv6 external services in options.</strong> <br/><br/>\
                  To allow them again, please go to Settings -> External services page.") ;
            }
         },
         /* service results */
         function(service, result) {
            var noDataErr = Conetserv.LookingGlass.manuallyStopped ?
               "<strong>Request has been stopped before managing to return any data.</strong>"
               : "<strong>Server has not returned any data. </strong> <br /><br /> Try choosing a different server in settings page.";
            var err = "<strong>Server has most probably encountered an error with following output: </strong> <br /> <br />";

            var isErr = function(data) {
               if(data.split("\n").length < 4)
                  return true;
               else
                  return false;
            };

            switch(service.service) {
               case 'PING':
                  if(Conetserv.ExternalServices.Ping.next > Conetserv.ExternalServices.Ping.max) {
                     return;
                  }
                  if(Conetserv.ExternalServices.Ping.next == Conetserv.ExternalServices.Ping.max) {
                     Conetserv.Ui.removeIcons(".external", ".ping");
                  }
                  $("#external-ping-service-" + Conetserv.ExternalServices.Ping.next).html(service.name);
                  if(result == "") {
                     Conetserv.ExternalServices.Ping.console[Conetserv.ExternalServices.Ping.next++].setErr(noDataErr);
                  }
                  else if(isErr(result)){
                     Conetserv.ExternalServices.Ping.console[Conetserv.ExternalServices.Ping.next++].setErr(err + result);
                  }
                  else {
                     Conetserv.ExternalServices.Ping.console[Conetserv.ExternalServices.Ping.next++].add(result + '\n');
                  }
                  break;
                case 'PING6':
                  if(Conetserv.ExternalServices.Ping6.next > Conetserv.ExternalServices.Ping6.max) {
                     return;
                  }
                  if(Conetserv.ExternalServices.Ping6.next == Conetserv.ExternalServices.Ping6.max) {
                     Conetserv.Ui.removeIcons(".external", ".ping6");
                  }
                  $("#external-ping6-service-" + Conetserv.ExternalServices.Ping6.next).html(service.name);
                  if(result == "") {
                     Conetserv.ExternalServices.Ping6.console[Conetserv.ExternalServices.Ping6.next++].setErr(noDataErr);
                  }
                  else if(isErr(result)){
                     Conetserv.ExternalServices.Ping6.console[Conetserv.ExternalServices.Ping6.next++].setErr(err + result);
                  }
                  else {
                     Conetserv.ExternalServices.Ping6.console[Conetserv.ExternalServices.Ping6.next++].add(result + '\n');
                  }
                  break;
               case 'TRACE':
                  if(Conetserv.ExternalServices.Tracert.next > Conetserv.ExternalServices.Tracert.max) {
                     return;
                  }
                  if(Conetserv.ExternalServices.Tracert.next == Conetserv.ExternalServices.Tracert.max) {
                     Conetserv.Ui.removeIcons(".external", ".tracert");
                  }
                  $("#external-tracert-service-" + Conetserv.ExternalServices.Tracert.next).html(service.name);
                  if(result == "") {
                     Conetserv.ExternalServices.Tracert.console[Conetserv.ExternalServices.Tracert.next++].setErr(noDataErr);
                  }
                  else if(isErr(result)){
                     Conetserv.ExternalServices.Tracert.console[Conetserv.ExternalServices.Tracert.next++].setErr(err + result);
                  }
                  else {
                     Conetserv.ExternalServices.Tracert.console[Conetserv.ExternalServices.Tracert.next++].add(result + '\n');
                  }
                  break;
               case 'TRACE6':
                  if(Conetserv.ExternalServices.Tracert6.next > Conetserv.ExternalServices.Tracert6.max) {
                     return;
                  }
                  if(Conetserv.ExternalServices.Tracert6.next == Conetserv.ExternalServices.Tracert6.max) {
                     Conetserv.Ui.removeIcons(".external", ".tracert6");
                  }
                  $("#external-tracert6-service-" + Conetserv.ExternalServices.Tracert6.next).html(service.name);
                  if(result == "" ) {
                     Conetserv.ExternalServices.Tracert6.console[Conetserv.ExternalServices.Tracert6.next++].setErr(noDataErr);
                  }
                  else if(isErr(result)){
                     Conetserv.ExternalServices.Tracert6.console[Conetserv.ExternalServices.Tracert6.next++].setErr(err + result);
                  }
                  else {
                     Conetserv.ExternalServices.Tracert6.console[Conetserv.ExternalServices.Tracert6.next++].add(result + '\n');
                  }
                  break;
               default:
                  break;
            }
         },
         /* stopped */
         function() {
            Conetserv.ExternalServices.stop();
         }
      )
      return true;
   },

   stop: function () {
      /*
       * Check if stop is possible
       */
      if(!this.enabled || !this.isRunning) {
         return false;
      }

      /*
       * Stop looking glass
       */
      Conetserv.LookingGlass.stop();

      /*
       * remove ui icons
       */
      Conetserv.Ui.removeIcons(".external", ".ping");
      Conetserv.Ui.removeIcons(".external", ".ping6");
      Conetserv.Ui.removeIcons(".external", ".tracert");
      Conetserv.Ui.removeIcons(".external", ".tracert6");

      /*
       * change button icon
       */
      Conetserv.Ui.stopToStart("#external-url-start");

      /*
       * enable input
       */
      Conetserv.Ui.enableInput("#external-url");
      
      this.isRunning = 0;

      return true;
   }
}

