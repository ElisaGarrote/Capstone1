from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Depreciation)
admin.site.register(Product)
admin.site.register(Status)
admin.site.register(Asset)
admin.site.register(AssetImage)
admin.site.register(Repair)
admin.site.register(RepairFile)
admin.site.register(AuditSchedule)
admin.site.register(Audit)
admin.site.register(AuditFile)
