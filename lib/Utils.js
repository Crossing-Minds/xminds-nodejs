'use strict';

const utils = (module.exports = {

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

})