function testOne(params, callback) {
    if (params) {
        console.log("Enter if statement");
        return callback(params);
    }
    console.log("executing other part of if");
}

testOne("Test params", function (params) {
    console.log("printing from callback function");
});