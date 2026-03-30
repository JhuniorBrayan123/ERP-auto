pipeline {
  agent none // Se declara "none" para poder lanzar contenedores aislados en las etapas "parallel"

  parameters {
    choice(name: 'TARGET_ENV', choices: ['crt', 'prd'], description: 'Entorno objetivo')
    choice(name: 'SUITE', choices: ['logistica', 'puntoventa', 'full'], description: 'Módulo a ejecutar o Full(Paralelo)')
  }

  environment {
    CI = 'true'
  }

  // --- VARIABLES PRELIMINARES ---
  stages {
    
    // Este Stage configura cuál URL usaremos según lo que escojamos en la UI de Jenkins
    stage('Set Base URL') {
      agent any
      steps {
        script {
          if (params.TARGET_ENV == 'crt') {
            env.BASE_URL = 'https://erpperu2-crt.smartclic.pe/'
          } else {
            env.BASE_URL = 'https://erpperu2.smartclic.pe/'
          }
        }
      }
    }

    // --- EJECUCIÓN DINÁMICA DE TESTS ---
    stage('Test Execution') {
      // Inyectamos credenciales GLOBALES para todas las suites
      environment {
        USER_EMAIL = credentials('erp-user-email') // Mapeado en Jenkins Credentials
        USER_PASSWORD = credentials('erp-user-password') 
      }

      // Este bloque divide el trabajo: si eliges "full", corre Logistica y PuntoVenta simultáneamente en diferentes contenedores Docker.
      parallel {
        
        stage('Logistica Tests') {
          when {
            anyOf {
              expression { params.SUITE == 'logistica' }
              expression { params.SUITE == 'full' }
            }
          }
          agent {
            docker {
              image 'mcr.microsoft.com/playwright:v1.58.2-noble'
              args '--ipc=host'
            }
          }
          steps {
            // Cada contenedor necesita compilar independientemente
            checkout scm
            sh 'npm ci'
            
            // Ejecutamos específicamente la carpeta de Logística (aquí adentro correrá el 'setup' primero gracias a PW)
            sh 'npx playwright test tests/Logistica --project=chromium'
          }
        }

        stage('Punto de Venta Tests') {
          when {
            anyOf {
              expression { params.SUITE == 'puntoventa' }
              expression { params.SUITE == 'full' }
            }
          }
          agent {
            docker {
              image 'mcr.microsoft.com/playwright:v1.58.2-noble'
              args '--ipc=host'
            }
          }
          steps {
            // Contenedor aislado para PuntoVenta
            checkout scm
            sh 'npm ci'
            
            // Suponiendo que tienes una carpeta PuntoVentaa
            sh 'npx playwright test tests/PuntoVentaa --project=chromium'
          }
        }
        
      }
    }
  }

  post {
    always {
      // Estos plugins deben estar instalados en tu servidor Jenkins
      junit testResults: 'test-results/*.xml', allowEmptyResults: true
      publishHTML(target: [
        reportName: 'Playwright HTML Report',
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        keepAll: true,
        alwaysLinkToLastBuild: true,
        allowMissing: true
      ])
    }
  }
}
