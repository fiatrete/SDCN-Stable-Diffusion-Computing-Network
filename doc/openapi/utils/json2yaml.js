const fs = require("fs");
const YAML = require("json-to-pretty-yaml");
const yaml = require("js-yaml");
const jsonPath = process.argv[2];
let json;

function deleteApifoxProps(obj) {
    for (let key in obj) {
        if (key.includes('apifox')) {
            delete obj[key];
        } else if (typeof obj[key] === 'object') {
            deleteApifoxProps(obj[key]);
        }
    }
    return obj
}


fs.readFile(jsonPath, "utf8", (err, jsonString) => {
    if (err) throw err;
    // parse json to yaml
    json = JSON.parse(jsonString);
    let yamlData = YAML.stringify(json);
    // yaml to js object
    let data = yaml.load(yamlData);
    data = deleteApifoxProps(data)
    console.log('data', data)
    // load md content
    mdString = fs.readFileSync("../intro.md", "utf8");
    data.info.description = mdString;
    // change example name
    for (let path in data.paths) {
        const responses = data.paths[path].post.responses;
        for (let statusCode in responses) {
            const content = responses[statusCode].content;
            console.log(
                `Response for ${path} with status code ${statusCode}: `,
                content
            );
            const examples = content["application/json"].examples;
            const newExamples = {};
            for (let key in examples) {
                const value = examples[key];
                newExamples[value.summary] = Object.assign({}, value);;
            }
            data.paths[path].post.responses[statusCode].content["application/json"].examples = newExamples
        }
    }
    // js object to yaml
    yamlData = yaml.dump(data);
    // yaml save file
    fs.writeFile("../dan.yaml", yamlData, (err) => {
        if (err) throw err;
        console.log("Data has been written to file!");
    });
});


