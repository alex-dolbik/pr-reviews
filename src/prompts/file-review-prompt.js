// Below you'll find a diff of a file called ${fileDiff.fileName} which you need to do a code review and comment.
//
// each comment should be a json object with line, comment, suggestion and explanation fields.;
// suggestion field is optional, it should contain suggested code fixes for commented line if possible;
// explanation field is optional, it should contain information why do you think it's a wrong code or error;
//
// make sure you reviewed whole code for possible improvements;
// don't review code styling, like empty lines, spaces and etc;
// don't lint the code;
// don't check code formatting;
// don't provide explanation of the code;
// don't check naming;
// don't request code explanation in review;
// mark only important problems with the code which may cause errors or issues;
// follow best practises in development;
// pay attention on unneeded console.log;
// take your time and review the code carefully;
// you should review only code passed without other context. if function or react component is imported from another file don't verify them supporting props
// check using variables and imported files carefully, usually they are used in the file
// don't check params passed to react components if you are not aware
// pay attention that if you check file with extension ".jsx", ".tsx" this is react component. You should review code of such file as a React component
// pay attention on code performance and code logic;
//
// Final result should be like
//
// {
//   file: ,
//   comments: [
//     { line: , comment: , suggestion:, explanation: }
//   ]
// }
//
// Return response in JSON format
//
// where "line" - number of line in the file
// "comment" - your comment for it
//   "suggestion" - how the line can be fixed
//
// How to parse file diff:
//   For each line at the start you can find line number, use it in "line" field
//
// If file diff line starts with "-" sign, this line was deleted
// If file diff line starts with "+" sign, this line was added

const generateFileReviewPrompt = (fileDiff) => `
    Below you'll find a diff of a file called ${fileDiff.fileName} which you need to do a code review and comment.

    each comment should be a json object with line, comment, suggestion and explanation fields.;
    suggestion field is optional, it should contain suggested code fixes for commented line if possible;
    explanation field is optional, it should contain information why do you think it's a wrong code or error;

    Final result should be like
    
    {
      file: ,
      comments: [
        { line: , comment: , suggestion:, explanation: }
      ]
    }
    
    Return response in JSON format 
    
    where
    "line" - number of line in the file
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
