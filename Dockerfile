ARG IMAGE=arti.iscinternal.com/ç/iris:2021.1.0PYTHON.330.0
# For an M1 Mac, comment the line below and uncomment the one pulling irishealth-community-arm64
#ARG IMAGE=containers.intersystems.com/intersystems/irishealth-community:2022.1.0.199.0
ARG IMAGE=containers.intersystems.com/intersystems/irishealth-community-arm64:2022.1.0.199.0

FROM $IMAGE

USER root

WORKDIR /opt/irisapp
RUN chown ${ISC_PACKAGE_MGRUSER}:${ISC_PACKAGE_IRISGROUP} /opt/irisapp
COPY irissession.sh /
RUN chmod +x /irissession.sh 

USER irisowner

COPY  Installer.cls .
COPY  src src
SHELL ["/irissession.sh"]

RUN \
  do $SYSTEM.OBJ.Load("Installer.cls", "ck") \
  set sc = ##class(App.Installer).setup() 

# bringing the standard shell back
SHELL ["/bin/bash", "-c"]
