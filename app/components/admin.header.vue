<template>
	
<!-- Main Header -->
<header class="main-header">
    <!-- Logo -->
    <a :href="config.backend.url" class="logo">
        <!-- mini logo for sidebar mini 50x50 pixels -->
        <span class="logo-mini">{{ $t("message.site_small_text") }}</span>

        <!-- logo for regular state and mobile devices -->
        <span class="logo-lg">{{ $t("message.site_big_text") }}</span>
    </a>

    <!-- Header Navbar -->
    <nav class="navbar navbar-static-top" role="navigation">
        
        <!-- Sidebar toggle button-->
        <a href="#" class="sidebar-toggle" data-toggle="offcanvas" role="button" v-if="showToggleButton">
            <span class="sr-only">{{ $t("message.toggle_navigation") }}</span>
        </a>

        <!-- Navbar Right Menu -->
        <div class="navbar-custom-menu">
            
            <ul class="nav navbar-nav">
                
                <!-- Messages: style can be found in dropdown.less-->
                <li class="dropdown messages-menu" v-if="messages.length > 0">
                    <!-- Menu toggle button -->
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <i class="fa fa-envelope-o"></i>
                        <span class="label label-success">{{messages.length}}</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li class="header">{{ $t("message.message_count", {count: messages.length}) }}</li>
                        <li>
                            <!-- inner menu: contains the messages -->
                            <ul class="menu">
                                <li>
                                    <!-- start message -->
                                    <a href="#">
                                        <div class="pull-left">
                                            <!-- User Image -->
                                            <img src="dist/img/user2-160x160.jpg" class="img-circle" alt="User Image">
                                        </div>
                                        <!-- Message title and timestamp -->
                                        <h4>
					                        Support Team
					                        <small><i class="fa fa-clock-o"></i> 5 mins</small>
					                    </h4>
                                        <!-- The message -->
                                        <p>Why not buy a new awesome theme?</p>
                                    </a>
                                </li>
                                <!-- end message -->
                            </ul>
                            <!-- /.menu -->
                        </li>
                        <li class="footer"><a href="#">{{$t("message.view_all")}}</a></li>
                    </ul>
                </li>
                <!-- /.messages-menu -->

                <!-- Notifications Menu -->
                <li class="dropdown notifications-menu" v-if="notifications.length > 0">
                    <!-- Menu toggle button -->
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <i class="fa fa-bell-o"></i>
                        <span class="label label-warning">{{notifications.length}}</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li class="header">{{ $t("message.notiification_count", {count: notifications.length}) }}</li>
                        <li>
                            <!-- Inner Menu: contains the notifications -->
                            <ul class="menu">
                                <li>
                                    <!-- start notification -->
                                    <a href="#">
                                        <i class="fa fa-users text-aqua"></i> 5 new members joined today
                                    </a>
                                </li>
                                <!-- end notification -->
                            </ul>
                        </li>
                        <li class="footer"><a href="#">{{$t("message.view_all")}}</a></li>
                    </ul>
                </li>

                <!-- Tasks Menu -->
                <li class="dropdown tasks-menu" v-if="tasks.length > 0">
                    
                    <!-- Menu Toggle Button -->
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <i class="fa fa-flag-o"></i>
                        <span class="label label-danger">{{tasks.length}}</span>
                    </a>

                    <ul class="dropdown-menu">
                        <li class="header">{{ $t("message.task_count", {count: tasks.length}) }}</li>
                        <li>
                            <!-- Inner menu: contains the tasks -->
                            <ul class="menu">
                                <li>
                                    <!-- Task item -->
                                    <a href="#">
                                        <!-- Task title and progress text -->
                                        <h3>
					                        Design some buttons
					                        <small class="pull-right">20%</small>
					                    </h3>
                                        <!-- The progress bar -->
                                        <div class="progress xs">
                                            <!-- Change the css width attribute to simulate progress -->
                                            <div class="progress-bar progress-bar-aqua" style="width: 20%" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100">
                                                <span class="sr-only">20% Complete</span>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                                <!-- end task item -->
                            </ul>
                        </li>
                        <li class="footer">
                            <a href="#">{{$t("message.view_all")}}</a>
                        </li>
                    </ul>
                </li>

                <!-- User Account Menu -->
                <li class="dropdown user user-menu" v-if="userprofile">
                    <!-- Menu Toggle Button -->
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <!-- TODO: The user image in the navbar-->
                        <!-- <img src="dist/img/user2-160x160.jpg" class="user-image" alt="User Image"> -->

                        <!-- hidden-xs hides the username on small devices so only the image appears. -->
                        <span class="hidden-xs">{{userprofile.name}}, ({{userprofile.type | capitalize}})</span>
                    </a>
                </li><!-- EO User Account Menu -->
                
                <!-- Control Sidebar Toggle Button -->
                <li v-if="showgear">
                    <a href="#" data-toggle="control-sidebar"><i class="fa fa-gears"></i></a>
                </li><!-- EO Control Sidebar Toggle Button -->

            </ul>
        </div>
    </nav>
</header>
</template>

<script>
export default {
	name: 'AdminHeader',
	props: [
		'messages',
		'notifications',
		'tasks',
		'userprofile',
		'showgear',
		'showToggleButton'
	],
	data() {
		return {
			config: this.$config
		}
	}
}
</script>

<style></style>