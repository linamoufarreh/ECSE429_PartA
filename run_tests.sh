pathToJar=$1
java -jar $pathToJar & > /dev/null 2>&1 &
npm test && curl http://localhost:4567/shutdown