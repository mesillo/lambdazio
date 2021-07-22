# Lambdazio
Local Node.js AWS Kinesis->Lambda (stupid) debug tool.

## Usage
#### Start the KinesaLite server
```bash
./lambdazioServer.js
```
* You can use the web interface at [http://localhost:8910/](http://localhost:8910/) or the _awscli_ tool specifing _http://localhost:4567_ as endpoint of Kinesis service. 
#### Deploy a lambda:
* function code must be included (dependencies also) on a .zip file.
* .js file that contains, and export, the handler must be in the root of zip file.
* if not specified with `--filename \<handlerfilename>` option _index.js_ is asumed as name of the file exporting lambda function handler.
* if not specified with `--handler \<functionhandlername>` option _handler_ is asumed as name of the exported lambda function handler.
```bash
./deployLambda.js --zip-file <zipfilename> --name <functionname>
```
#### Start a deployed Lambda:
```bash
./startLambda.js --function-name <functionname> --stream-name <streamname>
```
### Windows OS
If you use Windows then command must be executed in a PowerShell instance. A bash command that look like "./\<commnad>.js --option value" in Bash/Sh must be "translated" in "node \<command>.js --option value".

#### Listen to me (an idiot)
Use wsl instead of PS.
