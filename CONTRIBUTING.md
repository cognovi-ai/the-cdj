# Contributing to The CDJ! 🤖 🧠

## Contents

- [Contributing to The CDJ! 🤖 🧠](#contributing-to-the-cdj-🤖-🧠)
  - [Contents](#contents)
  - [Welcome!](#welcome)
    - [Why read this document?](#why-read-this-document)
    - [What can I contribute?](#what-can-i-contribute)
    - [What can I not contribute?](#what-can-i-not-contribute)
  - [Ground Rules](#ground-rules)
    - [Expectations](#expectations)
    - [Responsibilities](#responsibilities)
  - [Your First Contribution](#your-first-contribution)
  - [Getting started](#getting-started)
    - [Definitions](#definitions)
      - [Size of Pull Requests](#size-of-pull-requests)
      - [TDD from v2.0.0-beta](#tdd-from-v200-beta)
  - [Workflow](#workflow)
  - [How to report a bug](#how-to-report-a-bug)
    - [Security Vulnerabilities](#security-vulnerabilities)
    - [How to submit a (non-security) bug](#how-to-submit-a-non-security-bug)
  - [How to suggest a feature or enhancement](#how-to-suggest-a-feature-or-enhancement)
    - [Feature vs. Enhancement](#feature-vs-enhancement)
  - [Code Review Process](#code-review-process)
  - [Community](#community)
    - [Am I a contributor?](#am-i-a-contributor)
  - [Code Styling, Commit Messages, and Labeling Conventions](#code-styling-commit-messages-and-labeling-conventions)
    - [ES6+, TypeScript, and ESLint](#es6-typescript-and-eslint)
    - [Commit Messages](#commit-messages)
    - [Labels](#labels)
      - [Labels Examples](#labels-examples)

## Welcome!

Thank you for your interest in contributing to The CDJ! We welcome contributions from everyone, whether you're a seasoned developer or just starting out. This document will help you get started with contributing to The CDJ.

### Why read this document?

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

### What can I contribute?

All types of contributions are welcome. To start, improving documentation, bug triaging, writing unit tests, and writing tutorials are all wonderful and helpful contributions that have the added benefit of helping you get familiar with the project and the community. Once you're ready to contribute code for minor or major changes, you can have at any unassigned issues.

### What can I not contribute?

Please do not contribute any content that is not your own. This includes, but is not limited to, content that is copyrighted, patented, trademarked, or otherwise protected by intellectual property laws.

## Ground Rules

### Expectations

1. We expect all contributors to be respectful and considerate in their interactions with others. Since this project is open to all skill levels, we also expect contributors to be patient and helpful when interacting with others.

2. We expect all contributors to test their code before submitting a pull request. We also expect all contributors to be familiar with the project dependencies and to keep them up to date.

3. We expect all contributors to be familiar with the project's coding standards and to follow them when contributing code. We use ESLint to enforce our coding standards, so please make sure to run `npm run lint` before submitting a pull request.

4. We expect commit messages to be clear, concise, and descriptive. Long commit messages are fine only in the commit body, not in the subject line. We also expect commit messages to be written in the present tense, following the format: "Add feature", "Fix bug", "Update documentation", etc.

5. We expect all contributors to be familiar with the project's issue tracker and to use it to report bugs, suggest features, and ask questions. We also expect all contributors to be familiar with the project's pull request process and to follow it when submitting code.

### Responsibilities

1. Ensure cross-platform compatibility for every change that's accepted. Windows, Mac, Debian & Ubuntu Linux.

2. Ensure proper coding standards and practices are followed. Please refer to the project's ESLint configuration for details.

3. Create issues for any major changes and enhancements that you wish to make. Discuss things transparently and get community feedback.

4. Ensure documentation is up-to-date, both for code and features.

5. Ensure that your code is well-tested preferably with unit tests. We use Jest for testing, so please make sure to run any tests `npm run test` before submitting a pull request.

## Your First Contribution

Good first contributions help you learn the project and the community so that you can make more significant contributions in the future. Here are a few ways you can make your first contribution:

- Improving documentation. Documentation is important for any project, and sometime what made sense to one developer may not make sense to another. So, if you see something that could be improved, go ahead and make the change.

- Fixing bugs. Look through the project's issue tracker for bugs that have been reported. If you find one that you think you can fix, go ahead and fix it. Or, play around with the project and see if you can find any bugs yourself. If you do, write up an issue and try to fix it.

- Writing tests. For various reasons, there may be a lack of test coverage in the project. Writing tests is a great way to contribute to the project and ensure that it remains stable and reliable. Choose a file, figure out what it does, and write tests for it.

- Writing tutorials. If you like to take notes while you learn, why not turn those notes into a tutorial? You can write a tutorial on how to set up the project, how to use a particular feature, or how to solve a common problem.

If these are too open-ended for you, you can look for issues labeled "hello" in the project's issue tracker. These are issues with easy to medium difficulty that are ideal for new contributors of varying skill levels.

## Getting started

This section is a useful reference for all contributors to The CDJ. It defines the GitHub workspace, such as how issues are used, how to use the project board, and how to submit a pull request. In other words, it's a guide to the project's workflow.

### Definitions

- **Issues**: Issues are used to track bugs, feature requests, design ideas, and tasks. They are the primary way to communicate with the project's maintainers and contributors. Think of issues as a place to discuss and plan work on the project.

- **Project board**: The project board is used to track the progress of issues and pull requests. It is divided into columns that represent different stages of the project's workflow. These columns are labeled "Backlog", "Ready", "In Progress", "In Review", and "Done". The project board is a visual representation of the project's workflow. It helps contributors see what work is in progress, what work is ready to be picked up, and what work has been completed. In every Pull Request, you can set the project status in the right column under the "Projects" section. This will automatically move the PR to the corresponding column in the project board.
- **Pull requests**: Pull requests are used to submit code changes to the project. They are the primary way to contribute code to the project. Every pull request should be associated with an issue that it may close upon merging. **_All pull requests must be reviewed by the project owner before being merged._**
- **TDD**: Test-driven development (TDD) is a software development process that relies on the repetition of a very short development cycle: first the developer writes an (initially failing) automated test case that defines a desired improvement or new function, then produces the minimum amount of code to pass that test, and finally refactors the new code to acceptable standards.

#### Size of Pull Requests

The CDJ project follows the "small PR" philosophy. This means that pull requests should be small and focused on a single issue. This makes it easier to review and merge pull requests and reduces the risk of introducing bugs. If a pull request is too large, the project owner may ask the contributor to split it into smaller pull requests.

#### TDD from v2.0.0-beta

After version v2.0.0-beta, The CDJ will be developed using TDD. This means that all new features and bug fixes will be developed using TDD. This is to ensure that the project remains stable and reliable as it grows. The release of v2.0.0-beta indicates a transition from JavaScript to TypeScript. This transition will be gradual, with new features and bug fixes being written in TypeScript.

## Workflow

This section describes in step-by-step detail how to make a single contribution, from the initial issue to merging a pull request. We use an issue-driven sprint-like workflow to iteratively build the project. This workflow is based on the following steps:

1. **Find an issue to work on or create a new issue**: Look through the project's issue tracker for bugs that have been reported, features that have been requested, or tasks that need to be completed. If you find an issue that you think you can work on, assign it to yourself. If you don't find an issue that you want to work on, create a new issue.
2. **Create a new branch**: Create a new branch for your work. The branch name should be descriptive of the work you are doing. For example, if you are fixing a bug, the branch name could be `iss123-fix-bug`. If you are adding a feature, the branch name could be `iss124-add-feature`.
3. **Write code**: Write the code for the issue you are working on. Make sure to follow the project's coding standards and practices. Write tests for your code using Jest.
4. **Run tests**: Run the tests using `npm run test`. Make sure that all tests pass, yours and the existing ones, before submitting a pull request.
5. **Submit a pull request**: Submit a pull request to the project's repository. Make sure to reference the issue that the pull request is addressing and update the project board accordingly. The pull request should include a clear description of the work that was done. The project owner will review the pull request and provide feedback.
6. **Address feedback**: If the project owner requests changes to the pull request, make the changes and push them to the branch. The project owner will review the changes and provide further feedback if necessary. This process will continue until the pull request is ready to be merged.
7. **Merge the pull request**: Once the pull request has been reviewed and approved by the project owner, it can be merged into the project's repository. The project owner will merge the pull request and close the associated issue. The project board will be updated to reflect the completion of the work.
8. **Delete the branch**: After the pull request has been merged, the branch can be deleted. This keeps the project's repository clean and organized.
9. **Celebrate**: Congratulations! You have made a contribution to The CDJ. Thank you for your hard work and dedication.

## How to report a bug

### Security Vulnerabilities

**_If you find a security vulnerability, do NOT open an issue._** Instead email, security@thecdj.app. We will look into it immediately.

In order to determine whether you are dealing with a security issue, ask yourself these two questions:

- Can I access something that's not mine, or something I shouldn't have access to?
- Can I disable something for other people?

If the answer to either of those two questions are "yes", then you're probably dealing with a security issue. Note that even if you answer "no" to both questions, you may still be dealing with a security issue, so if you're unsure, just email us at security@thecdj.app.

### How to submit a (non-security) bug

If you find a bug in the source code, you can help us by submitting an issue to our GitHub Repository. Once you've created an issue, you are welcome to submit a pull request with a fix if you can. Otherwise, you can just wait for one of our maintainers to fix it.

When filing an issue, make sure to answer these five questions:

1. What version of The CDJ are you running locally?
2. What operating system, processor architecture, and browser are you using?
3. What did you do?
4. What did you expect to see?
5. What did you see instead?

Please provide as much detail as possible when answering these questions. The more information you provide, the easier it will be for us to reproduce the bug and fix it.

For any questions or general feedback, please email us at support@thecdj.app.

## How to suggest a feature or enhancement

If you find yourself wishing for a feature or enhancement feel free to open an issue describing the feature or enhancement you would like to see, why you need it, and how it should work.

### Feature vs. Enhancement

A feature is a new piece of functionality that doesn't exist yet. An enhancement is a change to an existing feature. If you're not sure which one you're suggesting, feel free to ask.

## Code Review Process

Once a pull request has been submitted, the project owner will review it and provide feedback. The project owner may request changes to the pull request, in which case the contributor should make the changes and push them to the branch. The project owner will review the changes and provide further feedback if necessary. This process will continue until the pull request is ready to be merged.

Depending on the complexity and size of the pull request, the review process may take anywhere from a few hours to a few days. The project owner will do their best to provide timely feedback and keep the contributor informed of the status of the pull request.

Ensuring that pull requests handle one issue at a time which introduces a single feature, enhancement, or bug fix will help streamline the review process. This will also help contributors get feedback on their work more quickly and reduce the risk of introducing bugs.

## Community

If you are a contributor, you are part of the community! Contributors will be invited to interact with other contributors, project maintainers, and users in our other channels.

### Am I a contributor?

Contributors don't only write code.

You are a contributor if you have contributed code, documentation, or other resources to the project. You are also a contributor if you have participated in discussions, provided feedback, or helped other contributors.

## Code Styling, Commit Messages, and Labeling Conventions

This section describes the commit message and labeling conventions used in The CDJ project. These conventions help to keep the project organized and make it easier to track changes and issues.

### ES6+, TypeScript, and ESLint

The CDJ project uses ES6+ and TypeScript for all new features and bug fixes. This means that all new code should be written in ES6+ and TypeScript. Existing code should be converted to ES6+ and TypeScript as it is modified.

ES6+ code should be written using modern JavaScript features such as arrow functions, template literals, and destructuring. TypeScript code should be written using TypeScript features such as type annotations, interfaces, and generics.

You know you are looking at ES6+ code when you see `import` and `export` statements.

Please ensure that your code follows the project's ESLint configuration. This will help to ensure that the code isn't only maintainable and consistent but also nice to look at.

### Commit Messages

Commit messages should be clear, concise, and descriptive. Long commit messages are fine only in the commit body, not in the subject line. Commit messages should be written in the present tense, following the format: "Add feature", "Fix bug", "Update documentation", etc.

If you are making a commit using `git commit -m` the message should then be clear, concise, and descriptive. For example, `git commit -m "Add feature to allow users to upload images"`.

If you are making a commit using `git commit`, you will be taken to a text editor where you can write a longer commit message. The first line should be a clear, concise, and descriptive summary of the commit. The following lines should provide more detail about the commit, if necessary. For example:

```
Add feature to allow users to upload images.

This commit adds a new feature that allows users to upload images to the project. The feature includes a new file input field on the upload page and a new API endpoint to handle image uploads.
```

### Labels

The CDJ project uses labels extensively to categorize issues and pull requests. Labels are used to provide additional context about the issue or pull request and indicate the expected version that the issue or pull request will push the project to.

The following labels are used in The CDJ project:

- `ai`: Indicates that the issue or pull request is an LLM feature or enhancement.
- `analytics`: Indicates that the issue or pull request is related to analytics.
- `api`: Indicates that the issue or pull request is related to the project's API or backend.
- `bug`: Indicates that the issue or pull request is a bug that needs to be fixed.
- `cleanup`: Indicates that the issue or pull request is related to cleaning up the project's codebase.
- `concept`: Indicates that the issue or pull request is a concept or idea that needs to be explored.
- `db`: Indicates that the issue or pull request is related to the project's database.
- `dependencies`: Indicates that the issue or pull request is related to the project's dependencies.
- `documentation`: Indicates that the issue or pull request is related to the project's documentation.
- `duplicate`: Indicates that the issue or pull request is a duplicate of another issue or pull request.
- `enhancement`: Indicates that the issue or pull request is an enhancement that needs to be made.
- `feature`: Indicates that the issue or pull request is a new feature that needs to be added.
- `hello`: Indicates that the issue or pull request is a good first issue for new contributors.
- `help`: Indicates that the issue or pull request needs help from the community.
- `invalid`: Indicates that the issue or pull request is invalid and should be closed.
- `major`: Indicates that the issue or pull request is a major change that will push the project to a new major version.
- `minor`: Indicates that the issue or pull request is a minor change that will push the project to a new minor version.
- `patch`: Indicates that the issue or pull request is a patch that will push the project to a new patch version.
- `privacy`: Indicates that the issue or pull request is related to user privacy.
- `question`: Indicates that the issue or pull request is a question that needs to be answered.
- `refactor`: Indicates that the issue or pull request adds no new functionality but refactors existing code.
- `research`: Indicates that the issue or pull request is related to research that needs to be done.
- `revert`: Indicates that the issue or pull request reverts a previous change.
- `scalability`: Indicates that the issue or pull request is related to the project's scalability.
- `security`: Indicates that the issue or pull request is related to security.
- `test`: Indicates that the issue or pull request is related to testing.
- `ui`: Indicates that the issue or pull request is related to the project's user interface.
- `ux`: Indicates that the issue or pull request is related to the project's user experience.
- `wontfix`: Indicates that the issue or pull request will not be fixed.

#### Labels Examples

1. You are working on a bug that needs to be fixed on the project's API. Chain the `bug`, `api`, and `patch` labels.
2. You are working on a new enhance,ent that will improve the project's user interface. Chain the `feature`, `ui`, and `minor` labels.
3. You are working on a concept or idea that needs to be explored. Chain the `concept`, `research`, or `question` labels.
4. You are working on a feature that will introduce changes to both the project's API and user interface. Chain the `feature`, `api`, `ui`, and `major` labels.

Think of labels as a quick visual way to remember what an issue or pull request that you haven't looked at in a while is about. Or think of them as a way to quickly filter issues or pull requests by type or category at another time when you are looking for something specific to work on that matches your skills or interests. This may help you determine which labels to use when creating an issue or pull request.

If you are unsure which label to use, please feel free to ask in the issue or pull request.
