# larvitesdump

Dump data to and from elasticsearch

## Installation

(local)
```bash
npm i larvitesdump
```

(global)
```bash
npm i larvitesdump -g
```

## Use

Larvitesdump is thought to mimic mysqldump behaviour for easy transition for people coming from those tools. Also It feels pretty logical. :)

### Dump data from Elasticsearch

#### Minimal usage:

```bash
esdump
```

This will assume an elasticsearch server is running on 127.0.0.1 on port 9200 and it will output two files named "esdump_structure.ndjson" and esdump_data.ndjson in the current directory, containing all indices and all types.

#### Parameters

```bash
esdump -h 127.0.0.1 -P 9200 -o esdump.ndjson indice_name type_name1 type_name2 ...
```

## Under the hood

esdump consists of several processes to make it as fast as possible

* esdump - controls the other processes and sends data to stdout in the correct order
* esCaller - calls es initially and starts new calls via processEsCall
* processEsCall - sends an http call to ES, tells esCaller it got a reply, then parses and modifies the content and passing it back to esdump main process
