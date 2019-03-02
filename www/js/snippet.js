(function(){
  //// SOME INTERESTING GLOBAL STUFF

  /*
  // SET UP A FAKE PLUGIN FOR OUR FRIEND MR. WEB BROWSER
  const gtagNative = {
    logEvent: (eventName, params) => new Promise((resolve, reject) => {
      console.log("Got firebase event", eventName, params);
      resolve(null);
    }),
    setUserProperty: (key, value) => new Promise((resolve, reject) => {
      console.log("Setting user property", key, value);
      resolve(null);
    }),
  };

  // SWITCH THE PLUGIN ON OR OFF HERE
  window.gtagNative = gtagNative;
  */

  // GLOBAL FIREBASE TARGET CONFIGURATION
  // When gtag(config, ...) is called with a firebase hybrid target, and the
  // target is enabled, it is set here.

  // Rule: 0 or 1 targets may be configured to intercept firebase events.
  let firebaseHybridTarget = null;
  // TODO: validate / filter config fields. Figure out what firebase's data
  // model is.
  let firebaseHybridConfig = null;
  // Any set commands will be mirrored here
  // TODO: need a list of config parameters that are not simply forwarded as
  // event parameters. More accurately, we need a *whitelist* of parameters
  // that firebase finds intersting. For now, we simply assume it's all of them.
  let globalGtagConfig = {};

  /**
   * Proxy an object with a "default property getter". The proxy will forward
   * property lookups to the underlying object. If the object has no such
   * property, it calls the "default property getter". The getter is called with
   * the property name, and has its `this` set to the instance.
   *
   * @param  {!object} object The object to wrap in a default getter
   * @param  {function(string)} getter) The default property getter
   * @return {!Proxy} A proxy object which uses the default getter
   */
  const withDefaultGetter = (object, getter) => new Proxy(object, {
    get: (target, prop) => target[prop] || getter.call(target, prop)
  });

  const shouldInterceptEvent = config => {
    if(firebaseHybridTarget === null) {
      return false;
    } else if(config.send_to == null) {
      return true;
    } else if(config.send_to === firebaseHybridTarget) {
      return true;
    } else if(config.send_to instanceof Array && config.send_to.includes(firebaseHybridTarget)) {
      return true;
    } else {
      return false;
    }
  };

  // Variant Gtag code lives here
  const modifiedGtags = withDefaultGetter({
    // Variant config rules: if a config line includes a hybridAnalytics field, and
    // hybrid is enabled, redirect to it. Set up the configuration locally and
    // prevent gtag from seeing it.
    config: (targetId, config = {}) => {
      if(config.hybridAnalytics && window.gtagNative) {
        if(firebaseHybridTarget !== null) {
          throw new Error("Can't register more than 1 native handler!");
        }

        firebaseHybridTarget = targetId;
        delete config.hybridAnalytics;
        firebaseHybridConfig = config;
      } else {
        return originalGtag('config', targetId, config);
      }
    },
    // Modified set does two things:
    // - Intercept userProperties events. Forward them to firebase, and prevent
    //   gtag from seeing them.
    // - Mirror the global config, so that it can be forwarded to firebase as
    //   needed.
    set: (config) => {
      if(config.userProperties) {
        if(window.gtagNative) {
          // TODO: does `set` support a callback?
          // TODO: type check the parameters
          Promise.all(Object
            .getOwnPropertyNames(config.userProperties)
            .map(name => window
              .gtagNative
              .setUserProperty(name, config.userProperties[name])
            )
          );
        }
        delete config.userProperties;
      }
      Object.assign(globalGtagConfig, config);
      return originalGtag('set', config);
    },
    // Modified event:
    // - If there's a firebase target set up, and the event is detected to send
    //   to it (either no send_to, or the correct send_to), send it there with
    //   all the configured parameters.
    // - Rewire the event_callback if necessary.
    event: (eventName, params) => {
      // TODO: groups

      // Design notes: We have to wrap up the callback so that it awaits both
      // gtag and firebase's completions.

      const callback = params.event_callback;
      delete params.event_callback;

      // Tasks holds the set of Promises: one for firebase, one for gtag
      const tasks = [];

      // FIREBASE STUFF
      if(window.gtagNative && shouldInterceptEvent(params)) {
        // Create merged event
        const fullParams = Object.assign({}, globalGtagConfig, firebaseHybridConfig, params);
        // TODO: what else to delete?
        // TODO: type filtering
        // TODO: reinsert all the stuff that gtag automatically inserts (device
        // information, timestamp, etc)
        delete fullParams.send_to;
        delete fullParams.groups;
        delete fullParams.event_callback;
        delete fullParams.event_timeout;

        // TODO: does gtag's event_callback have an error protocol?
        const eventPromise = window.gtagNative
           .logEvent(eventName, fullParams)
           .catch(err => console.error("There was an logging an event to firebase", eventName, fullParams, err));
        tasks.push(eventPromise);
      }

      // GTAG STUFF
      tasks.push(new Promise(resolve => {
        if(callback) {
          params.event_callback = () => resolve();
        }
        // TODO: should the firebase target be purged from params before sending
        // to gtag, since gtag isn't aware of a correctly configured target?
        originalGtag("event", eventName, params);
      }));

      if(callback) {
        Promise.all(tasks).then(() => callback());
      }
    },
  }, command => (...args) => originalGtag(command, ...args));
  window.gtag = (command, ...args) => modifiedGtags[command](...args);

  // Original snippet, slightly modified
  window.dataLayer = window.dataLayer || [];
  const originalGtag = (...args) => { window.dataLayer.push(args); };

  window.gtag('js', new Date());
  window.gtag('config', 'UA-112978143-2', {hybridAnalytics: true});
  window.gtag("event", "login", {method: "Google"});
})();
