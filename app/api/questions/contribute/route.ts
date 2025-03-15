import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { QuestionShell } from '@/lib/types';

// Configuration for GitHub repository
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'peanut996';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'random-interview-platform';
const QUESTION_BANK_PATH = 'data/questionBank.json';
const BASE_BRANCH = process.env.GITHUB_BASE_BRANCH || 'master';

export async function POST(req: NextRequest) {
  try {
    // Get request body
    const body = await req.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty questions array' }, { status: 400 });
    }



    // Get GitHub token from environment variable
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      return NextResponse.json({ error: 'GitHub token is not configured' }, { status: 500 });
    }

    // Initialize Octokit
    const octokit = new Octokit({ auth: githubToken });

    // Generate a unique branch name
    const timestamp = Date.now();
    const branchName = `feature/add-questions/${timestamp}`;

    try {
      // 1. Get the SHA of the latest commit on the base branch
      const { data: refData } = await octokit.git.getRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `heads/${BASE_BRANCH}`,
      });
      const baseSHA = refData.object.sha;

      // 2. Create a new branch
      await octokit.git.createRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `refs/heads/${branchName}`,
        sha: baseSHA,
      });

      // 3. Get the current content of the question bank file
      let questionBankContent: QuestionShell[] = [];
      let fileSHA: string | undefined;
      try {
        const { data: fileData } = await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: QUESTION_BANK_PATH,
          ref: branchName,
        });

        if ('content' in fileData) {
          const content = Buffer.from(fileData.content, 'base64').toString();
          questionBankContent = JSON.parse(content);

          // Save the SHA for update
          fileSHA = fileData.sha;
        }
      } catch (error) {
        // File may not exist yet, which is fine
        console.log('Question bank file does not exist yet, will create it', error);
      }

      // 4. Add the new questions to the array
      questionBankContent.push(...questions);

      // 5. Update or create the file
      const updatedContent = JSON.stringify(questionBankContent, null, 2);

      await octokit.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: QUESTION_BANK_PATH,
        message: `Add ${questions.length} new question${questions.length > 1 ? 's' : ''}`,
        content: Buffer.from(updatedContent).toString('base64'),
        branch: branchName,
        sha: fileSHA, // Only needed when updating an existing file,
        committer: {
          name: 'Interview Platform Bot',
          email: 'bot@example.com',
        },
        author: {
          name: 'Interview Platform Bot',
          email: 'bot@example.com',
        },
      });

      // 6. Create a pull request
      const questionTitles = questions.map(q => q.title).join(', ');
      const { data: prData } = await octokit.pulls.create({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        title: `[BOT] Add ${questions.length} new question${questions.length > 1 ? 's' : ''}`,
        head: branchName,
        base: BASE_BRANCH,
        maintainer_can_modify: true,
        body: `This PR adds ${questions.length} new interview question${questions.length > 1 ? 's' : ''} to the question bank.
          
**Questions Added:**
${questions.map((q, idx) => `${idx + 1}. **${q.title}** (${q.type}, ${q.difficulty})`).join('\n')}

These questions were contributed through the app's contribution feature.`,
      });

      return NextResponse.json({
        success: true,
        message: 'Pull request created successfully',
        url: prData.html_url,
        number: prData.number,
      });
    } catch (error) {
      console.error('GitHub API error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error interacting with GitHub API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Contribution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
