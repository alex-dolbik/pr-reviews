const parseDiff = (patch) => {
  const hunkInfo = patchStartEndLine(patch);
  if (hunkInfo == null) {
    return null;
  }

  const oldHunkLines = [];
  const newHunkLines = [];

  // let old_line = hunkInfo.old_hunk.start_line
  let newLine = hunkInfo.newHunk.startLine;

  const lines = patch.split('\n').slice(1); // Skip the @@ line

  // Remove the last line if it's empty
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  for (const line of lines) {
    const lineSign = line.substring(1, 0);
    if (line.startsWith('-')) {
      oldHunkLines.push(`${line.substring(1)}`);
      // old_line++
    } else if (line.startsWith('+')) {
      newHunkLines.push(`${newLine}: ${lineSign}${line.substring(1)}`);
      newLine++;
    } else {
      oldHunkLines.push(`${line}`);
      newHunkLines.push(`${newLine}: ${line}`);
      // old_line++
      newLine++;
    }
  }

  return {
    oldHunk: oldHunkLines.join('\n'),
    newHunk: newHunkLines.join('\n'),
  };
};

const patchStartEndLine = (patch) => {
  const pattern = /(^@@ -(\d+),(\d+) \+(\d+),(\d+) @@)/gm;
  const match = pattern.exec(patch);
  if (match != null) {
    const oldBegin = parseInt(match[2]);
    const oldDiff = parseInt(match[3]);
    const newBegin = parseInt(match[4]);
    const newDiff = parseInt(match[5]);
    return {
      oldHunk: {
        startLine: oldBegin,
        endLine: oldBegin + oldDiff - 1,
      },
      newHunk: {
        startLine: newBegin,
        endLine: newBegin + newDiff - 1,
      },
    };
  } else {
    return null;
  }
};

module.exports = {
  parseDiff,
};
