const generateFileReviewPrompt = (fileDiff) => `
  \`Below you'll find a diff of a file called ${fileDiff.fileName}.
   \\n --- \\n ${fileDiff.diff} \\n --- \\n
   What do you think of this code?
    call comment_on_file function with a your comments.
    each comment should be a json object with line, comment and suggestion fields.;
    suggestion field is optional, add it for complicated changes, it should contain code changes;
    make sure you reviewed whole code;
    don't review code styling, like empty lines, spaces and etc.
`;

module.exports = generateFileReviewPrompt;
