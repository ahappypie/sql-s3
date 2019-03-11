module.exports = (obj, drop) => {
    let newObj = {};
    Object.keys(obj).forEach(k => {
        if(drop.indexOf(k) < 0) {
            newObj[k] = obj[k];
        }
    });
    return newObj;
};