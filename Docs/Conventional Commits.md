
# Conventional Commits - Qué es y por qué deberías empezar a utilizarlo


¿Alguna vez te ha pasado que no sabes que formato usar al escribir un mensaje de un commit? ¿Cada persona del equipo sigue un formato diferente porque no hay un acuerdo entre todos? O lo que es peor, ¿usa emojis en los commits? Yo he sido de esos...

Pues Conventional Commits llega para solucionar todos esos problemas y más.

## ¿qué es Conventional Commits?

[Conventional Commits](https://www.conventionalcommits.org/) es una convención en el formato de los mensajes de los commits. Esta convención define una serie de reglas que hacen muy sencillo tanto la legibilidad del histórico del repositorio como el poder tener herramientas que automaticen procesos basándose en el historial de commits, por ejemplo, a la hora del versionado del proyecto.

Esta convención está muy ligada con [Semantic Versioning](http://semver.org/) (o SemVer), estableciendo la versión del proyecto basándose en los commits del repositorio.

> Conventional Commits es una especificación para dar significado a los mensajes de los commits haciéndolos legibles para máquinas y humanos.

## ¿qué es Semantic Versioning o SemVer?

A modo resumen, SemVer es la convención más extendida para establecer un versionado a librerías, paquetes, dependencias, y a la vida en general 🙃

El versionado se divide en tres bloques:  

```
// MAJOR.MINOR.PATCH

2.12.7
// 2 -> MAJOR
// 12 -> MINOR
// 7 -> PATCH
```

- **MAJOR**: número de versión que se incrementa cuando se rompe la compatibilidad de versiones anteriores.
- **MINOR**: número de versión que se incrementa cuando se añade funcionalidad y esta es compatible en la versión MAJOR actual.
- **PATCH**: número de versión que se incrementa cuando se arreglan errores en la versión MAJOR.MINOR actual.

Adicionalmente está permitido (y es muy común) añadir al bloque PATCH información adicional indicando si son versiones previas a un nuevo lanzamiento (alpha, beta, next, rc, ...) y el número de la compilación. Esta información adicional debe ir en el bloque PATCH precedido por un guión `-`.

Un ejemplo:  

```
12.2.0-alpha.0

// Aquí "alpha" indica el estado de la compilación y ".0" indica el número de compilación
```

Todo el detalle puedes consultarlo en la página oficial de [SemVer](https://semver.org/). Ahora sí, volvamos a Conventional Commits.

## Especificación de Conventional Commits

Conventional Commits especifica que el mensaje de commit debe ser estructurado de la siguiente manera:  

```
<tipo>(ámbito opcional): <descripción>
<LINEA_EN_BLANCO>
[cuerpo opcional]
<LINEA_EN_BLANCO>
[nota(s) al pie opcional(es)]
```

Hay ciertos elementos que serán utilizados para comunicar la intención del commit a terceros:

- Si el tipo es **fix** indica que el commit es un parche de un error y está relacionado con la versión [PATCH](https://semver.org/#summary) del proyecto.
- Si el tipo es **feat** indica que el commit añade una nueva funcionalidad y se relaciona con la versión [MINOR](https://semver.org/#summary) del proyecto.
- Añadir el texto **BREAKING CHANGE** en el footer de un commit, o el carácter `!` después del tipo, indica que se rompe la compatibilidad de la versión actual y está relacionado con la versión [MAJOR](http://semver.org/#summary) del proyecto.

Espero que aún no hayas hecho 🤯 porque de verdad que es muy sencillo. Vamos a ver cada una de las zonas del commit en detalle.

### [](https://dev.to/achamorro_dev/conventional-commits-que-es-y-por-que-deberias-empezar-a-utilizarlo-23an#tipo)Tipo

El primer elemento es el tipo de commit refiriéndose al contenido del commit. Basados en la [convención establecida por Angular](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines) estos son:

- **feat**: cuando se añade una nueva funcionalidad.
- **fix**: cuando se arregla un error.
- **chore**: tareas rutinarias que no sean específicas de una feature o un error como por ejemplo añadir contenido al fichero `.gitignore` o instalar una dependencia.
- **test**: si añadimos o arreglamos tests.
- **docs**: cuando solo se modifica documentación.
- **build**: cuando el cambio afecta al compilado del proyecto.
- **ci**: el cambio afecta a ficheros de configuración y scripts relacionados con la integración continua.
- **style**: cambios de legibilidad o formateo de código que no afecta a funcionalidad.
- **refactor**: cambio de código que no corrige errores ni añade funcionalidad, pero mejora el código.
- **perf**: usado para mejoras de rendimiento.
- **revert**: si el commit revierte un commit anterior. Debería indicarse el hash del commit que se revierte.

### [](https://dev.to/achamorro_dev/conventional-commits-que-es-y-por-que-deberias-empezar-a-utilizarlo-23an#%C3%A1mbito)Ámbito

El campo ámbito es opcional y sirve para dar información contextual como por ejemplo indicar el nombre de la feature a la que afecta el commit.

### [](https://dev.to/achamorro_dev/conventional-commits-que-es-y-por-que-deberias-empezar-a-utilizarlo-23an#descripci%C3%B3n)Descripción

Breve descripción del cambio cumpliendo lo siguiente:

- usa imperativos, en tiempo presente: “añade” mejor que “añadido” o “añadidos”
- la primera letra siempre irá en minúscula
- no escribir un punto al final

### [](https://dev.to/achamorro_dev/conventional-commits-que-es-y-por-que-deberias-empezar-a-utilizarlo-23an#cuerpo)Cuerpo

Es opcional y debería añadir aportar más información que la descripción. Debería usar el mismo tono imperativo que esta.

### [](https://dev.to/achamorro_dev/conventional-commits-que-es-y-por-que-deberias-empezar-a-utilizarlo-23an#nota-al-pie)Nota al pie

Es opcional. Siempre se utiliza para indicar cambios que rompan la compatibilidad de la versión actual (Breaking Changes) aunque también están permitidos otros formatos que sigan la convención de [git trailer format](https://git-scm.com/docs/git-interpret-trailers).

Si el pie de página indica un Breaking Change, el formato deberá ser el siguiente:  

```
BREAKING CHANGE: <description>
```

---

¿A que no ha sido tan difícil? Venga que seguro que unos ejemplos te ayudan.

## [](https://dev.to/achamorro_dev/conventional-commits-que-es-y-por-que-deberias-empezar-a-utilizarlo-23an#ejemplos)Ejemplos

### [](https://dev.to/achamorro_dev/conventional-commits-que-es-y-por-que-deberias-empezar-a-utilizarlo-23an#commit-rompiendo-la-compatibilidad-de-la-versi%C3%B3n-actual)Commit rompiendo la compatibilidad de la versión actual

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

### [](https://dev.to/achamorro_dev/conventional-commits-que-es-y-por-que-deberias-empezar-a-utilizarlo-23an#mismo-commit-que-antes-pero-indicando-la-ruptura-de-compatibilidad-con-raw-endraw-)Mismo commit que antes pero indicando la ruptura de compatibilidad con `!`

```
feat!: allow provided config object to extend other configs
```

### [](https://dev.to/achamorro_dev/conventional-commits-que-es-y-por-que-deberias-empezar-a-utilizarlo-23an#commit-con-%C3%A1mbito)Commit con ámbito

```
feat(lang): add spanish language
```

### [](https://dev.to/achamorro_dev/conventional-commits-que-es-y-por-que-deberias-empezar-a-utilizarlo-23an#commit-con-cuerpo-y-notas-al-pie)Commit con cuerpo y notas al pie

```
fix: correct minor typos in code

see the issue for details

on typos fixed.

Reviewed-by: Z
Refs #133
```

## [](https://dev.to/achamorro_dev/conventional-commits-que-es-y-por-que-deberias-empezar-a-utilizarlo-23an#por-qu%C3%A9-usar-conventional-commits)¿Por qué usar Conventional Commits?

- Conseguimos un acuerdo en el formato de los commits con todo el equipo de desarrollo tanto interno como externo
- Armonía en el histórico del repositorio
- Generación automática de CHANGELOG
- Versionado automático del proyecto

[Conventional Commits - Qué es y por qué deberías empezar a utilizarlo - DEV Community](https://dev.to/achamorro_dev/conventional-commits-que-es-y-por-que-deberias-empezar-a-utilizarlo-23an#descripci%C3%B3n)