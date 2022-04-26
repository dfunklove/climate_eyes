#!/bin/sh
cp climate-eyes.service /etc/systemd/system
systemctl daemon-reload
systemctl start climate-eyes.service
systemctl enable climate-eyes.service
