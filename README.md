# 9-axis_shock_algorithm_paper

## 충돌감지 알고리즘 실험 자료

### 충돌감지 알고리즘 실험 시각화 분석 자료

- https://kihyeon-hong.github.io/9-axis_shock_algorithm_paper/analysis/Shock_data_analysis_final1.html
- https://kihyeon-hong.github.io/9-axis_shock_algorithm_paper/analysis/Shock_data_analysis_final2.html

### 정지된 상태에서 MPU9250 센서의 오차 측정 실험 분석 자료

- https://github.com/KiHyeon-Hong/MPU9250_data_in_a_stationary_state_csv

## 파일 구조

### analysis/

- Shock_data_analysis_final.ipynb
  - 9축 데이터 분석 자료
- Shock_data_analysis_fina2.ipynb
  - 충돌감지 정확도 분석 자료

### datas/

- 실험을 위한 MPU9250 센서 데이터 측정 파일

### files/

- data.txt
  - save9axisData.js로 기록한 100회 충돌에 대한 9축 데이터 파일
- log.csv
  - 알고리즘 호출주기와 데이터 측정주기에 따른 충돌감지 결과
- config.json
  - 충돌감지 알고리즘 설정 파일

### Shock_level.js

- 9축센서 기반의 시설물 충돌감지 알고리즘 모듈

### save9axisData.js

- MPU9250 센서에서 측정되는 충돌데이터 저장 모듈

### load9axisData.js

- 저장된 충돌데이터 로드 모듈

### paperTestCode.js

- 충돌감지 알고리즘 호출 주기 및 데이터 측정 주기 변경하며 충돌감지 정확도 측정 실험 코드

## Data strcuture

### Input_Data

- 충격량 측정을 위한 입력 데이터 구조
- 충격량, 충격 방향, 시설물의 기울기를 측정하기 위해 9축 센서(가속도 센서, 자이로 센서, 지자기 센서)의 각 x, y, z 값을 입력으로 받는다.
- 이 때, MPU9250 센서를 기준으로 한다. MPU9250센서는 z축이 지면과 수직으로 중력가속도를 받는다.

### Output_Data

- 충격량 측정 결과로 출력되는 데이터 구조
- shocklevel (0: 충격 없음, 1: 약한 충격, 2: 강한 충격)
- shockDirection (센서의 y축을 기준으로 충격방향의 방위각 (0 ~ 359))
- azimuthShockDirection (북쪽을 기준으로 충격방향의 방위각 (0 ~ 359))
- shockValue (시설물에 가해진 충격량)
- degree (시설물이 현재 기울어진 각도 (0 ~ 90))
- azimuth (북쪽을 기준으로 현재 센서의 방위각)
- code (1: 정상 출력, -1: 비정상 출력)
- message (함수 API 실행 메시지)

## 9축센서 기반의 시설물 충돌감지 알고리즘 개요

- 9축센서 기반의 시설물 충돌감지 알고리즘은 9축 센서로부터 측정된 raw 데이터를 입력받아 시설물에 가해진 충격 강도, 충격 값, 그리고 충격 방향 등을 산출하여 반환하는 알고리즘
- 1개의 센서가 아닌 다중 센서로부터 받은 데이터를 융합하여 통합적으로 처리하는 알고리즘을 개발

![Feature 1](https://kihyeon-hong.github.io/Collection_of_repository_images/ShockLevel_test_code/feature1.jpg)

### 3축 가속도 센서 데이터 예제

- 3축(x, y, z)으로부터 측정되는 가속도에 대한 데이터 예제
- z축은 중력 가속도를 받으며, x축과 y축으로부터 충격량, 충격 방향, 그리고 기울기를 산출할 수 있다.

![Feature 2](https://kihyeon-hong.github.io/Collection_of_repository_images/ShockLevel_test_code/feature2.jpg)

#### 가속도 센서 데이터 분석

- 왼쪽에서 충격이 가해진다면 가속도 x축의 그래프가 양의 방향으로 변화한다.
- 오른쪽에서 충격이 가해진다면 가속도 x축의 그래프가 음의 방향으로 변화한다.
- 아래에서 충격이 가해진다면 가속도 y축의 그래프가 양의 방향으로 변화한다.
- 위에서 충격이 가해진다면 가속도 y축의 그래프가 음의 방향으로 변화한다.

#### 시설물 기울기 측정

- 시설물이 땅과 수직을 이룰 경우 z축은 중력 가속도를 그대로 받음
- 그러나 시설물이 기울어져 수직을 이루지 못할 경우 z축은 중력 가속도를 그대로 받지 못하며, x축과 y축이 받는 중력 가속도를 이용하여 시설물의 기울어진 정도를 측정할 수 있다.

![Feature 3](https://kihyeon-hong.github.io/Collection_of_repository_images/ShockLevel_test_code/feature3.jpg)

#### 시설물에 가해진 충격량 측정

- 시설물에 아무 충격이 가해지지 않을 경우 다음 그림의 식을 통해 얻은 값은 9.80665이다.
- 그러나 시설물에 일정 충격이 가해질 경우 해당 그림의 식을 통해 얻은 값은 9.80665 이상인 것을 볼 수 있다.

![Feature 4](https://kihyeon-hong.github.io/Collection_of_repository_images/ShockLevel_test_code/feature4.jpg)

- 이는 아래 그림의 빨간색 그래프와 같다.

![Feature 5](https://kihyeon-hong.github.io/Collection_of_repository_images/ShockLevel_test_code/feature5.jpg)

### 시설물 충격 시나리오

- 시설물에 충격이 발생하기 전의 중력 가속도를 받는 축은 1개이며, 이를 제외한 2개의 축은 0의 값을 보인다.
- 시설물에 충격이 발생하기 전의 자이로 센서의 변화는 없다.
- 시설물에 충격이 가해지고 기울어질 경우 가속도의 센서의 변화가 생기며, 자이로 센서의 값이 변화한다.
- 시설물이 기울어지는 것이 멈출 경우 자이로 센서의 값은 변화가 없으며, 3축에서 측정되는 중력 가속도 값이 달라진다.

![Feature 6](https://kihyeon-hong.github.io/Collection_of_repository_images/ShockLevel_test_code/feature6.jpg)

## 9축센서 기반의 시설물 충돌감지 알고리즘 모듈

- https://github.com/KiHyeon-Hong/9-axis_shock_algorithm_code
