const generateFileReviewPrompt = (fileDiff) => `
  \`Below you'll find a diff of a file called ${fileDiff.fileName} which you need to review and comment.
   What do you think of this code?
    each comment should be a json object with line, comment and suggestion fields.;
    suggestion field is optional, it should contain suggested code fixes for commented line if possible;
    make sure you reviewed whole code;
    don't review code styling, like empty lines, spaces and etc.
    don't provide explanation of the code
    don't request code explanation in review
    mark only important problems with the code which may cause errors or issues
    follow best practises
    
    Final result should be like
    
    {
      file: ,
      comments: [
        { line: , comment: , suggestion: }
      ]
    }
    
    Return response in JSON format 
    
    where "line" - number of line in the file
    "comment" - your comment for it
    "suggestion" - how the line can be fixed
    
    How to parse file diff:
    For each line at the start you can find line number, use it in "line" field
    
    If file diff line starts with "-" sign, this line was deleted
    If file diff line starts with "+" sign, this line was added
    
    File diff:
   \\n --- \\n ${fileDiff.diff} \\n --- \\n
`;

module.exports = generateFileReviewPrompt;
