# Contributing to PrivPass

Thank you for your interest in contributing to PrivPass! We welcome contributions from developers, cryptographers, and privacy advocates across the Web3 ecosystem.

## Development Workflow

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/your-username/privpass.git
   cd privpass
   ```

2. **Install Dependencies**:
   ```bash
   yarn install
   ```

3. **Branching Model**:
   - `main`: Production-ready branch.
   - `develop`: Ongoing feature staging.
   - Feature branches: `feat/feature-name`, `fix/issue-name`, `docs/doc-name`.

4. **Running Local Environment**:
   - Backend: `yarn dev:backend`
   - Frontend: `yarn dev:frontend`
   - Test suites: `yarn test`

5. **Commit Message Guidelines**:
   We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
   - `feat(...)`: New feature or capability.
   - `fix(...)`: Bug fix.
   - `docs(...)`: Documentation changes.
   - `test(...)`: Adding or updating test suites.
   - `refactor(...)`: Code refactoring without changing behavior.
   - `ci(...)`: CI/CD pipeline changes.

6. **Pull Request Process**:
   - Ensure all automated tests and typechecks pass before submitting.
   - Provide a clear PR description detailing motivation and verification steps.
   - Tag related issues in the PR description.
