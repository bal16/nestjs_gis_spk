 --> pn test:cov

> be@0.0.1 test:cov /mnt/d/Bal/Collage/Skripsi/code/be
> jest --coverage

 PASS  src/infra/database/prisma.service.spec.ts
 PASS  src/dss/dss.controller.spec.ts
 PASS  src/dss/dto/update-weights.dto.spec.ts
 PASS  src/auth/auth.service.spec.ts
 PASS  src/dss/dss.service.spec.ts
 PASS  src/building/dto/update-assessment.dto.spec.ts
 PASS  src/auth/auth.controller.spec.ts
 PASS  src/building/building.controller.spec.ts
 PASS  src/auth/auth.module.spec.ts
 PASS  src/auth/strategies/accessToken.guard.spec.ts
 PASS  src/building/building.service.spec.ts
 PASS  src/app.module.spec.ts
 PASS  src/auth/hash.service.spec.ts
 PASS  src/auth/strategies/refreshToken.guard.spec.ts
 PASS  src/app.controller.spec.ts
 PASS  src/common/env.spec.ts
 PASS  src/user/user.module.spec.ts
 PASS  src/user/user.service.spec.ts
 PASS  src/building/dto/update-building.dto.spec.ts
 PASS  src/auth/dto/jwt.dto.spec.ts
 PASS  src/building/dto/create-assessment.dto.spec.ts
 PASS  src/building/dto/create-building.dto.spec.ts
---------------------------|---------|----------|---------|---------|-------------------
File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------------|---------|----------|---------|---------|-------------------
All files                  |     100 |    79.01 |     100 |     100 |                   
 src                       |     100 |    66.66 |     100 |     100 |                   
  app.controller.ts        |     100 |       75 |     100 |     100 | 6                 
  app.module.ts            |     100 |       50 |     100 |     100 | 27                
  app.service.ts           |     100 |      100 |     100 |     100 |                   
 src/auth                  |     100 |    79.31 |     100 |     100 |                   
  auth.controller.ts       |     100 |       75 |     100 |     100 | 30-86             
  auth.module.ts           |     100 |      100 |     100 |     100 |                   
  auth.service.ts          |     100 |    84.61 |     100 |     100 | 25-27             
  hash.service.ts          |     100 |      100 |     100 |     100 |                   
 src/auth/dto              |     100 |      100 |     100 |     100 |                   
  jwt.dto.ts               |     100 |      100 |     100 |     100 |                   
  login.dto.ts             |     100 |      100 |     100 |     100 |                   
  registeration.dto.ts     |     100 |      100 |     100 |     100 |                   
  registerd-user.dto.ts    |     100 |      100 |     100 |     100 |                   
 src/auth/entities         |     100 |       75 |     100 |     100 |                   
  current.entity.ts        |     100 |       75 |     100 |     100 | 20-23             
  login.entity.ts          |     100 |      100 |     100 |     100 |                   
 src/auth/strategies       |     100 |    77.77 |     100 |     100 |                   
  accessToken.guard.ts     |     100 |    77.77 |     100 |     100 | 17                
  refreshToken.guard.ts    |     100 |    77.77 |     100 |     100 | 17                
 src/building              |     100 |       75 |     100 |     100 |                   
  building.controller.ts   |     100 |       75 |     100 |     100 | 21                
  building.module.ts       |     100 |      100 |     100 |     100 |                   
  building.service.ts      |     100 |       75 |     100 |     100 | 10                
 src/building/dto          |     100 |      100 |     100 |     100 |                   
  create-assessment.dto.ts |     100 |      100 |     100 |     100 |                   
  create-building.dto.ts   |     100 |      100 |     100 |     100 |                   
  update-assessment.dto.ts |     100 |      100 |     100 |     100 |                   
  update-building.dto.ts   |     100 |      100 |     100 |     100 |                   
 src/common                |     100 |      100 |     100 |     100 |                   
  env.ts                   |     100 |      100 |     100 |     100 |                   
 src/common/responses      |     100 |        0 |     100 |     100 |                   
  web.response.ts          |     100 |        0 |     100 |     100 | 8                 
 src/dss                   |     100 |    82.35 |     100 |     100 |                   
  dss.controller.ts        |     100 |       75 |     100 |     100 | 21                
  dss.module.ts            |     100 |      100 |     100 |     100 |                   
  dss.service.ts           |     100 |    82.97 |     100 |     100 | 11,165-171        
 src/dss/dto               |     100 |      100 |     100 |     100 |                   
  update-weights.dto.ts    |     100 |      100 |     100 |     100 |                   
 src/infra/database        |     100 |       75 |     100 |     100 |                   
  prisma.module.ts         |     100 |      100 |     100 |     100 |                   
  prisma.service.ts        |     100 |       75 |     100 |     100 | 8                 
 src/user                  |     100 |       75 |     100 |     100 |                   
  user.module.ts           |     100 |      100 |     100 |     100 |                   
  user.service.ts          |     100 |       75 |     100 |     100 | 7                 
---------------------------|---------|----------|---------|---------|-------------------

Test Suites: 22 passed, 22 total
Tests:       112 passed, 112 total
Snapshots:   0 total
Time:        3.817 s
Ran all test suites.
