module.exports = function (wp, ee) {
    return {
        createPost: function (postObj) {
            wp.posts().create(postObj).then(function (response) {
                ee.emit('wp-post-create', response);
            });
        },

        updatePost: function (postObj, condition) {
            //Update previous created
            ee.on('wp-post-create', function (data) {
                for (var i in condition) {
                    if (!data.hasOwnProperty(i) || (data[i] !== condition[i] && data[i]['raw'] !== condition[i] )) {
                        return '';
                    }
                }
                wp.posts().id(data.id).update(postObj);
            });

            //Update existing
            wp.posts().param(condition).then(function (post) {
                wp.posts().id(post[0].id).update(postObj);
            });
        }
    };
};
