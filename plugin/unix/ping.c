#include <stdio.h>

#include "debug.h"
#include "identifier.h"
#include "npapi.h"
#include "module.h"
#include "init_modules.h"
#include "shell.h"

module *ping = NULL;

static bool
hasMethod(NPObject *obj, NPIdentifier identifier)
{
   if (identifier == identifiers->start) {
      DEBUG_STR("plugin->ping->hasMethod(%s): true", DEBUG_IDENTIFIER(identifier));
      return true;
   }

   DEBUG_STR("plugin->ping->hasMethod(%s): false", DEBUG_IDENTIFIER(identifier));
   return false;
}

static bool
invokeMethod(NPObject *obj, NPIdentifier identifier, const NPVariant *args, uint32_t argc, NPVariant *result)
{
   if (identifier == identifiers->start) {
      char *argv[10];
      int i = 0;

      if (argc < 1)
         return false;

      if (args[0].type != NPVariantType_String)
         return false;

      argv[i++] = "ping";
      argv[i++] = "-n";

      /*
      while (i < argc) {

      }
      */

      argv[i++] = (char *)STRING_UTF8CHARACTERS(args[0].value.stringValue);
      argv[i++] = NULL;

      OBJECT_TO_NPVARIANT(browser->createobject(((object *)obj)->instance, &processClass), *result);
      DEBUG_STR("plugin->ping->invokeMethod(%s): true", DEBUG_IDENTIFIER(identifier));

      if (shell->run((process *)result->value.objectValue, ((shell_module *)ping)->path, argv))
         return true;
      else
         return false;
   }

   DEBUG_STR("plugin->ping->invokeMethod(%s): false", DEBUG_IDENTIFIER(identifier));
   return false;
}

static bool
invokeDefault(NPObject *obj, const NPVariant *args, const uint32_t argCount, NPVariant *result)
{
   DEBUG_STR("plugin->ping->invokeDefault(): false");
   return false;
}

static bool
hasProperty(NPObject *obj, NPIdentifier identifier)
{
   DEBUG_STR("plugin->ping->hasProperty(%s): false", DEBUG_IDENTIFIER(identifier));
   return false;
}

static bool
getProperty(NPObject *obj, NPIdentifier identifier, NPVariant *result)
{
   DEBUG_STR("plugin->ping->getProperty(%s): false", DEBUG_IDENTIFIER(identifier));
   return false;
}

static NPObject *
allocate(NPP instance, NPClass *class)
{
   object *obj;

   DEBUG_STR("plugin->ping->allocate()");

   obj = browser->memalloc(sizeof(*obj));
   obj->instance = instance;

   return (NPObject *)obj;
}

static void
deallocate(NPObject *obj)
{
   DEBUG_STR("plugin->ping->deallocate()");
   browser->memfree(obj);
}


NPClass class = {
   NP_CLASS_STRUCT_VERSION,
   allocate,
   deallocate,
   NULL/*invalidate*/,
   hasMethod,
   invokeMethod,
   invokeDefault,
   hasProperty,
   getProperty,
   NULL/*setProperty*/,
   NULL/*removeProperty*/,
   NULL/*enumerate*/,
   NULL/*construct*/
};

static void
destroy()
{
   DEBUG_STR("ping->destroy()");
   shell->destroy_module((shell_module *)ping);
}

bool
init_module_ping()
{
   DEBUG_STR("ping->init()");
   ping = (module *)shell->init_module("ping");
   ping->destroy = destroy;
   ping->class = class;

   return true;
}