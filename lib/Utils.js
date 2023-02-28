module.exports = {

    /**
     * Returns an array of string with formatted query params.
     * Given an array of filters.
     * 
     * @param {Array<Object>} filtersArray 
     * @returns {Array<String>} contains the formatted query params
     * 
     */
    getFormattedFiltersArray: function(filtersArray) {
        let queryParamsArray = [];
        filtersArray.map(filter => {
            queryParamsArray.push(filter.property_name + ':' + filter.op + (filter.value ? (':' + filter.value) : ''));
        });
        return queryParamsArray;
    },

    /**
     * Converts an object to querystring
     * 
     * @param {Object} queryParams 
     * @returns {String} the querystring
     */
    convertToQueryString: function(queryParams) {
        if (Object.keys(queryParams).length !== 0) {
            const serialize = function(obj, prefix) {
                var str = [], p;
                for (p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        var k = prefix ? prefix : p;
                        var v = obj[p];
                        str.push((v !== null && typeof v === "object") ?
                            serialize(v, k) :
                            encodeURIComponent(k) + "=" + encodeURIComponent(v));
                    }
                }
                return str.join("&");
            }
            return '?' + serialize(queryParams)
        } else {
            return '';
        }
    },

    /**
     * Divides an array into chunks given the chunk size
     * 
     * @param {Array} array the array to be chunked
     * @param {Number} chunkSize the size of the chunks
     * @returns {Array} - array that contain the objects with chunked data
     * 
     */
    chunk: (array, chunkSize) =>
        Array.from({ length: Math.ceil(array.length / chunkSize) }, (v, k) =>
            array.slice(k * chunkSize, k * chunkSize + chunkSize)
        )

}