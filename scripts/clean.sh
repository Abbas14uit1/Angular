#!/bin/bash

#Used to clean the CI machine where docker ends up leaking and uses all the available space. scheduled as a part of cron
echo "Time: $(/bin/date). Started clean up." > /home/ubuntu/cron.log
/usr/bin/docker rm `/usr/bin/docker ps -aq`
/usr/bin/docker volume rm $(/usr/bin/docker volume ls -qf dangling=true)
/usr/bin/docker system prune -a -f

echo "Time: $(/bin/date). Completed clean up." >> /home/ubuntu/cron.log

