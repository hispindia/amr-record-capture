# AMR Data Entry and Approval

### TODO
- [x] Deleting records
- [x] Editing person values
- [x] Numbers only text fields
- [x] Deselectable radio buttons
- [x] Disabling field after ASSIGN rule action
- [x] Storing incomplete records
- [x] Susceptibility colors based on result
- [x] Yellow and red DD/MIC colors more distinguishable
- [x] Getting metadata at startup
- [x] Hide result section
- [x] Same sections on approval screen as on entry screen
- [x] Modals
- [ ] Automatic duplication check
- [ ] Hashing patient registration number
- [ ] DD not have color when MIC has value
- [ ] Special characters in test values
- [ ] Warning/error program rule action

### Installation
```
cd [root_dir]
yarn install
cd [root_dir]/approval
yarn install
cd [root_dir]/entry
yarn install
```

### Development
You need to log in to the test server:
`https://amrtest.icmr.org.in/amrtest`

```
cd [root_dir]
yarn start
cd [root_dir]/approval
yarn start
cd [root_dir]/entry
yarn start
```

### Building
```
cd [root_dir]
yarn build
```

### Versioning
```
cd [root_dir]
yarn bump x.x.x
```