const generateFileReviewPrompt = (fileDiff) => `
  \`Below you'll find a diff of a file called ${fileDiff.fileName} which you need to review and comment.
   \\n --- \\n ${fileDiff.diff} \\n --- \\n
   What do you think of this code?
    each comment should be a json object with line, comment and suggestion fields.;
    suggestion field is optional, it should contain suggested code fixes for commented line if possible;
    make sure you reviewed whole code;
    don't review code styling, like empty lines, spaces and etc.
    don't provide explanation for the code
    
    Final result should be like
    
    {
      file: ,
      comments: [
        { line: , comment: , suggestion: }
      ]
    }
    
    Return response in JSON format 
`;

module.exports = generateFileReviewPrompt;
